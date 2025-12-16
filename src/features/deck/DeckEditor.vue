<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "../../utils/supabase";
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useCards } from "./useCards";
import { useDeck } from "./useDeck";
import { notificationsStore } from "@/stores/notificationsStore";
import { TrashIcon, PlusIcon, SettingsIcon, SaveIcon } from "lucide-vue-next";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));

type AttributeType = Database["public"]["Enums"]["attribute_type"];

const newAttributeName = ref("");
const newAttributeType = ref<AttributeType>("text");

const attributeTypeOptions: Array<AttributeType> = ["text", "image"];

const deckAttributes = ref<
	Array<Database["public"]["Tables"]["deck_attribute_type"]["Row"]>
>([]);

const { deck } = useDeck(deckId);
const { cards: editedCards } = useCards(deckId);

const cardsToDelete = ref<Array<number>>([]);

const selectedCardId = ref<number | null>(null);
const showSettings = ref(false);

const visibleCards = computed(() => {
	return editedCards.value.filter(
		(card) => !cardsToDelete.value.includes(card.id),
	);
});

const selectedCard = computed(() => {
	return visibleCards.value.find((c) => c.id === selectedCardId.value);
});

// Auto-select first card when data loads
watch(visibleCards, (newCards) => {
	if (selectedCardId.value === null && newCards.length > 0) {
		selectedCardId.value = newCards[0].id;
	}
});

onMounted(() => {
	fetchAttributeTypes();
});

async function fetchAttributeTypes() {
	console.log("fetching attribute types");
	if (Number.isNaN(deckId)) {
		return;
	}
	try {
		const { data, error } = await supabase
			.from("deck_attribute_type")
			.select()
			.eq("deck_id", deckId);

		if (error) {
			console.error("Error fetching attribute types:", error);
			return;
		}
		console.log("fetched attribute types", data);

		deckAttributes.value = data;
	} catch (error) {
		console.error("Error fetching attribute types:", error);
	}
}

async function saveDeck() {
	console.log("saving deck", editedCards);
	if (Number.isNaN(deckId)) {
		return;
	}

	try {
		// save deck changes
		if (deck.value) {
			console.log("saving deck changes", deck.value);
			const { error } = await supabase
				.from("deck")
				.update({ name: deck.value.name })
				.eq("id", deckId);

			if (error) {
				console.error("Error saving deck change:", error);
				return;
			}
		}

		// handle deletions first
		if (cardsToDelete.value.length > 0) {
			console.log("deleting cards", cardsToDelete.value);
			const { error: deleteError } = await supabase
				.from("card")
				.delete()
				.in("id", cardsToDelete.value);

			if (deleteError) {
				console.error("Error deleting cards:", deleteError);
				notificationsStore.queueNotification({
					message: `Error: ${deleteError.message}`,
					type: "ERROR",
				});
				return;
			}
		}

		// prepare cards to upsert (excluding those we just deleted)
		const cardsToUpsert = editedCards.value.filter(
			(card) => !cardsToDelete.value.includes(card.id),
		);

		// if there's nothing left to save, we're done
		if (cardsToUpsert.length === 0) {
			notificationsStore.queueNotification({
				message: "Saved Deck",
				type: "SUCCESS",
			});
			return;
		}

		type CardAttributeValue =
			(typeof cardsToUpsert)[number]["card_attribute_value"][number];
		// keep track of temporary IDs and their associated attributes
		const tempIdToAttributesMap = new Map<number, Array<CardAttributeValue>>();
		const cardsToSave = cardsToUpsert.map((card) => {
			if (card.id === undefined) {
				throw Error(`card missing id ${card.front_content}`);
			}

			// for new cards (negative IDs), store attributes with their temp ID
			if (card.id < 0) {
				// Remember the temp ID and its attributes
				tempIdToAttributesMap.set(card.id, card.card_attribute_value);

				/* eslint-disable @typescript-eslint/no-unused-vars */
				const {
					id,
					created_at,
					updated_at,
					card_attribute_value,
					...cardWithoutId
				} = card;
				return cardWithoutId;
			}

			// for existing cards, collect attributes normally
			const { card_attribute_value, ...cardWithoutAttributes } = card;
			/* eslint-enable @typescript-eslint/no-unused-vars */

			return cardWithoutAttributes;
		});

		console.log("saving cards", cardsToSave);

		// Save the cards first
		const { data: savedCards, error } = await supabase
			.from("card")
			.upsert(cardsToSave, {
				defaultToNull: false,
			})
			.select();

		if (error) {
			console.error("Error saving cards:", error);
			return;
		}

		console.log("saved cards", savedCards);

		// prepare the attributes with the correct card IDs
		const attributesToSave: Array<
			Omit<CardAttributeValue, "id" | "created_at" | "deck_attribute_type">
		> = [];

		// first handle attributes for existing cards
		cardsToUpsert.forEach((card) => {
			if (card.id >= 0 && card.card_attribute_value) {
				card.card_attribute_value.forEach((attribute) => {
					if (attribute.id === undefined) {
						throw Error(`attribute missing id ${attribute}`);
					}

					if (attribute.id < 0) {
						/* eslint-disable @typescript-eslint/no-unused-vars */
						const {
							id,
							created_at,
							deck_attribute_type,
							...attributeWithoutId
						} = attribute;
						attributesToSave.push(attributeWithoutId);
					} else {
						const { deck_attribute_type, ...attributeWithoutDeckAttribute } =
							attribute;
						/* eslint-enable @typescript-eslint/no-unused-vars */
						attributesToSave.push(attributeWithoutDeckAttribute);
					}
				});
			}
		});

		// Handle attributes for newly created cards and sync local state with database response
		if (savedCards) {
			// Map the original cards to the saved cards to find corresponding IDs
			cardsToUpsert.forEach((originalCard, index) => {
				if (originalCard.id < 0) {
					// Capture temp ID before mutation
					const tempId = originalCard.id;
					// Get the equivalent card that was saved (matching by index)
					const savedCard = savedCards[index];

					if (!savedCard) {
						console.warn(
							`No saved card found for temporary card ID ${originalCard.id}`,
						);
						return;
					}

					// Handle attributes for this newly created card
					if (tempIdToAttributesMap.has(originalCard.id)) {
						const attributesForThisCard = tempIdToAttributesMap.get(
							originalCard.id,
						);

						attributesForThisCard?.forEach((attribute) => {
							/* eslint-disable @typescript-eslint/no-unused-vars */
							const {
								id,
								created_at,
								deck_attribute_type,
								...attributeWithoutId
							} = attribute;
							/* eslint-enable @typescript-eslint/no-unused-vars */

							// Use the real card_id from the database response
							attributesToSave.push({
								...attributeWithoutId,
								card_id: savedCard.id,
							});
						});
					}

					// Update selection if we just saved the currently selected new card
					if (selectedCardId.value === tempId) {
						selectedCardId.value = savedCard.id;
					}

					// Replace the local card with the database version to get all server-managed fields
					Object.assign(originalCard, savedCard);

					// Update all local attributes to reference the new positive card ID
					// This prevents issues if attributes are edited immediately after saving
					if (originalCard.card_attribute_value) {
						originalCard.card_attribute_value.forEach((attr) => {
							attr.card_id = savedCard.id;
						});
					}
				}
			});
		}

		console.log("saving attributes", attributesToSave);

		if (attributesToSave.length > 0) {
			const { data: attributeSaveData, error: attributeSaveError } =
				await supabase.from("card_attribute_value").upsert(attributesToSave, {
					defaultToNull: false,
				});
			console.log("attribute save data", attributeSaveData);

			if (attributeSaveError) {
				console.error("Error saving attributes:", attributeSaveError);
			}
		}

		// update local state
		if (cardsToDelete.value.length > 0) {
			editedCards.value = editedCards.value.filter(
				(card) => !cardsToDelete.value.includes(card.id),
			);
		}
		cardsToDelete.value = [];

		notificationsStore.queueNotification({
			message: "Saved Deck",
			type: "SUCCESS",
		});
	} catch (error) {
		console.error("Error saving cards:", error);
	}
}

async function handleAddAttributeClick() {
	if (newAttributeName.value === "") {
		return;
	}
	const deckId = Number.parseInt(String(route.params.id));
	if (Number.isNaN(deckId)) {
		return;
	}
	const response = await supabase.from("deck_attribute_type").insert({
		attribute_name: newAttributeName.value,
		deck_id: deckId,
		display_order: deckAttributes.value.length + 1,
	});

	console.log(response);

	newAttributeName.value = "";
	newAttributeType.value = "text";
	fetchAttributeTypes();
}

let negativeId = -1;

function handleNewCardClick() {
	// use negative numbers to differentiate from cards that have been saved.
	// those cards will have a generated id which will be positive
	const cardId = -performance.now();
	console.log("new card", cardId);

	const cardAttributeValues = deckAttributes.value.map<
		(typeof editedCards.value)[number]["card_attribute_value"][number]
	>((attributeType) => {
		return {
			id: negativeId--,
			card_id: cardId,
			value: "",
			created_at: "",
			deck_attribute_type_id: attributeType.id,
			deck_attribute_type: {
				attribute_name: attributeType.attribute_name,
			},
		};
	});

	editedCards.value.push({
		id: cardId,
		created_at: "",
		notes: "",
		updated_at: "",
		deck_id: deckId,
		front_content: "",
		display_order: editedCards.value.length,
		card_attribute_value: cardAttributeValues,
	});

	// Select the new card immediately
	selectedCardId.value = cardId;

	// Scroll the sidebar to bottom
	nextTick(() => {
		const sidebar = document.querySelector(".slides-sidebar");
		if (sidebar) sidebar.scrollTop = sidebar.scrollHeight;
	});
}

function handleSaveClick() {
	saveDeck();
}

function handleRemoveCardClick(cardId: number) {
	// Determine if we are deleting the currently selected card
	const isSelected = selectedCardId.value === cardId;
	const currentIndex = visibleCards.value.findIndex((c) => c.id === cardId);

	if (cardId < 0) {
		// this is a new, unsaved card, so we can just remove it from the local list
		editedCards.value = editedCards.value.filter((c) => c.id !== cardId);
	} else {
		// this is an existing card, so we need to mark it for deletion on the next save
		cardsToDelete.value.push(cardId);
	}

	// Update selection logic: move to previous card, or next if at start
	if (isSelected) {
		// Wait for computed property to update
		nextTick(() => {
			if (visibleCards.value.length === 0) {
				selectedCardId.value = null;
			} else {
				// Try to go to the card at the same index (which is now the "next" card), or the one before it
				const newIndex = Math.min(currentIndex, visibleCards.value.length - 1);
				selectedCardId.value = visibleCards.value[newIndex].id;
			}
		});
	}
}
</script>

<template>
	<div class="slides-layout" v-if="deck">
		<!-- LEFT SIDEBAR: Slides/Cards List -->
		<aside class="slides-sidebar">
			<div class="sidebar-header">
				<hgroup>
					<h3 class="deck-title">{{ deck.name }}</h3>
					<small>{{ visibleCards.length }} cards</small>
				</hgroup>
				<button
					class="icon-only outline"
					@click="showSettings = !showSettings"
					data-tooltip="Deck Settings"
				>
					<SettingsIcon :size="20" />
				</button>
			</div>

			<div class="cards-list">
				<div
					v-for="(card, index) in visibleCards"
					:key="card.id"
					class="slide-thumbnail"
					:class="{ active: selectedCardId === card.id }"
					@click="selectedCardId = card.id"
				>
					<span class="slide-number">{{ index + 1 }}</span>
					<div class="slide-preview">
						<div class="preview-content">{{ card.front_content }}</div>
					</div>
					<button
						class="delete-btn"
						@click.stop="handleRemoveCardClick(card.id)"
					>
						<TrashIcon :size="16" />
					</button>
				</div>
			</div>

			<div class="sidebar-footer">
				<button @click="handleNewCardClick" class="outline contrast full-width">
					<PlusIcon :size="18" /> New Card
				</button>
			</div>
		</aside>

		<!-- RIGHT MAIN: Editor Canvas -->
		<main class="slides-editor">
			<!-- Global Toolbar (Always Visible) -->
			<div class="editor-toolbar">
				<button @click="handleSaveClick" class="save-button">
					<SaveIcon :size="18" /> Save Deck
				</button>
			</div>

			<!-- Deck Settings Overlay/Panel -->
			<article v-if="showSettings" class="settings-panel">
				<header>
					<strong>Deck Settings</strong>
					<button class="close-btn" @click="showSettings = false">✕</button>
				</header>
				<label>
					Deck Name
					<input v-model="deck.name" />
				</label>

				<hr />

				<h6>Attributes</h6>
				<div class="grid">
					<input v-model="newAttributeName" placeholder="New attribute name" />
					<select v-model="newAttributeType">
						<option
							v-for="attributeTypeOption in attributeTypeOptions"
							:key="attributeTypeOption"
						>
							{{ attributeTypeOption }}
						</option>
					</select>
					<button @click="handleAddAttributeClick" class="outline">Add</button>
				</div>
				<div class="tags">
					<span
						v-for="deckAttribute in deckAttributes"
						:key="deckAttribute.id"
						class="tag"
					>
						{{ deckAttribute.attribute_name }}
					</span>
				</div>
			</article>

			<!-- Active Card Editor -->
			<div v-if="selectedCard" class="editor-container">
				<article class="card-form">
					<label>
						Front Content
						<textarea
							class="front-content-input"
							v-model="selectedCard.front_content"
							rows="4"
							placeholder="Type the front of the card here..."
						></textarea>
					</label>

					<!-- Attributes Loop -->
					<div class="attributes-grid">
						<template
							v-for="attribute in selectedCard.card_attribute_value"
							:key="attribute?.id"
						>
							<label>
								{{ attribute?.deck_attribute_type.attribute_name }}
								<textarea v-model="attribute.value" rows="2"></textarea>
							</label>
						</template>
					</div>
				</article>
			</div>

			<div v-else class="empty-state">
				<article>
					<header>No Card Selected</header>
					<p>Select a card from the left sidebar or create a new one.</p>
					<button @click="handleNewCardClick">Create First Card</button>
				</article>
			</div>
		</main>
	</div>
</template>

<style scoped>
/* Layout Container */
.slides-layout {
	display: flex;
	height: 100%;
	width: 100%;
	overflow: hidden;
	background-color: var(--pico-background-color);
}

/* --- Left Sidebar --- */
.slides-sidebar {
	width: 280px;
	flex-shrink: 0;
	background-color: var(--pico-card-background-color);
	border-right: 1px solid var(--pico-muted-border-color);
	display: flex;
	flex-direction: column;
	height: 100%;
}

.sidebar-header {
	padding: 1rem;
	border-bottom: 1px solid var(--pico-muted-border-color);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.sidebar-header hgroup {
	margin-bottom: 0;
}

.deck-title {
	font-size: 1rem;
	margin: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 160px;
}

.cards-list {
	flex: 1;
	overflow-y: auto;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.sidebar-footer {
	padding: 1rem;
	border-top: 1px solid var(--pico-muted-border-color);
}

/* Thumbnail Items */
.slide-thumbnail {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
	position: relative;
	padding: 4px;
	border-radius: var(--pico-border-radius);
	transition: background-color 0.2s;
}

.slide-thumbnail:hover {
	background-color: var(--pico-muted-border-color);
}

.slide-thumbnail.active {
	background-color: var(--pico-primary-background);
}

.slide-thumbnail.active .slide-preview {
	border: 2px solid var(--pico-primary);
}

.slide-number {
	font-size: 0.8rem;
	color: var(--pico-muted-color);
	width: 20px;
	text-align: right;
}

.slide-preview {
	flex: 1;
	height: 50px;
	background-color: var(--pico-background-color);
	border: 1px solid var(--pico-muted-border-color);
	border-radius: 4px;
	padding: 4px;
	overflow: hidden;
	font-size: 0.7rem;
	color: var(--pico-color);
}

.preview-content {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.delete-btn {
	padding: 0;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	border: none;
	color: var(--pico-muted-color);
	opacity: 0;
	transition: opacity 0.2s;
}

.delete-btn:hover {
	color: var(--pico-color);
	background: transparent;
}

.slide-thumbnail:hover .delete-btn {
	opacity: 1;
}

/* --- Right Main Editor --- */
.slides-editor {
	flex: 1;
	position: relative;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	padding: 1rem 2rem;
}

.editor-toolbar {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 1rem;
	flex-shrink: 0; /* Don't shrink when scrolling */
}

.card-form {
	max-width: 800px;
	margin: 0 auto;
	width: 100%;
}

.front-content-input {
	font-size: 1.25rem;
	min-height: 120px;
}

.attributes-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1rem;
	margin-top: 1rem;
	border-top: 1px dashed var(--pico-muted-border-color);
	padding-top: 1rem;
}

@media (min-width: 992px) {
	.attributes-grid {
		grid-template-columns: 1fr 1fr;
	}
}

/* Settings Panel */
.settings-panel {
	margin-bottom: 2rem;
	border: 1px solid var(--pico-primary);
}

.settings-panel header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.close-btn {
	background: transparent;
	border: none;
	padding: 0;
	width: auto;
	color: var(--pico-muted-color);
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-top: 1rem;
}

.tag {
	background-color: var(--pico-card-background-color);
	border: 1px solid var(--pico-muted-border-color);
	padding: 0.25rem 0.5rem;
	border-radius: var(--pico-border-radius);
	font-size: 0.8rem;
}

/* Utilities */
.full-width {
	width: 100%;
}

.icon-only {
	padding: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
}

.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}
</style>
