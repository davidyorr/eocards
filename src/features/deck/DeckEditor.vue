<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "../../utils/supabase";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useCards } from "./useCards";
import { useDeck } from "./useDeck";
import { notificationsStore } from "@/stores/notificationsStore";
import { TrashIcon } from "lucide-vue-next";

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

const visibleCards = computed(() => {
	return editedCards.value.filter(
		(card) => !cardsToDelete.value.includes(card.id),
	);
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
}

function handleSaveClick() {
	saveDeck();
}

function handleRemoveCardClick(cardId: number) {
	if (cardId < 0) {
		// this is a new, unsaved card, so we can just remove it from the local list
		editedCards.value = editedCards.value.filter((c) => c.id !== cardId);
	} else {
		// this is an existing card, so we need to mark it for deletion on the next save
		cardsToDelete.value.push(cardId);
	}
}
</script>

<template>
	<div class="content" v-if="deck">
		<h1>Deck Editor</h1>
		<div class="deck-settings">
			<label>
				Deck Name:
				<input v-model="deck.name" />
			</label>
			<!-- <label>
				Description:
				<textarea v-model="deck.description"></textarea>
			</label> -->
		</div>
		<h2>Attributes</h2>
		<div>
			<input v-model="newAttributeName" placeholder="name" />
			<select v-model="newAttributeType">
				<option
					v-for="attributeTypeOption in attributeTypeOptions"
					:key="attributeTypeOption"
				>
					{{ attributeTypeOption }}
				</option>
			</select>
			<button @click="handleAddAttributeClick">Add Attribute</button>
		</div>
		<div class="attributes-container">
			<div v-for="deckAttribute in deckAttributes" :key="deckAttribute.id">
				{{ deckAttribute.attribute_name }} - {{ deckAttribute.attribute_type }}
			</div>
		</div>
		<h2>Cards</h2>
		<button @click="handleSaveClick">Save Deck</button>
		<div class="cards">
			<div v-for="card in visibleCards" :key="card.id" class="card">
				<button
					class="remove-card-button"
					@click="handleRemoveCardClick(card.id)"
				>
					<TrashIcon :size="24" />
				</button>
				<div class="input-container">
					<label>Front</label>
					<textarea
						class="front-content"
						v-model="card.front_content"
					></textarea>
				</div>
				<template
					v-for="attribute in card.card_attribute_value"
					:key="attribute?.id"
				>
					<div class="input-container">
						<label>{{ attribute?.deck_attribute_type.attribute_name }}</label>
						<textarea v-model="attribute.value"></textarea>
					</div>
				</template>
			</div>
			<button @click="handleNewCardClick">New Card</button>
		</div>
	</div>
</template>

<style scoped>
.content {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: 0 auto;
	gap: 16px;

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		grid-gap: 16px;
		grid-auto-flow: dense;

		.card {
			position: relative;
			box-shadow: rgba(100, 100, 111, 0.2) 0px 0px 6px 0px;
			padding: 12px;

			.input-container {
				display: flex;
				flex-direction: column;
			}

			.input-container:not(:last-child) {
				margin-bottom: 8px;
			}

			label {
				display: inline-block;
				align-self: center;
			}

			textarea {
				margin-left: 4px;
				resize: none;
			}
		}

		.remove-card-button {
			position: absolute;
			top: 2px;
			right: 2px;

			width: auto;
			background: none;
			border: none;
			padding: 0.25rem;
			color: var(--secondary);
		}
	}

	button {
		width: 256px;
		cursor: pointer;
	}
}
</style>
