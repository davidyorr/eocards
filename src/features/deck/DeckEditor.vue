<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "../../utils/supabase";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useCards } from "./useCards";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));

type AttributeType = Database["public"]["Enums"]["attribute_type"];

const newAttributeName = ref("");
const newAttributeType = ref<AttributeType>("text");

const attributeTypeOptions: Array<AttributeType> = ["text", "image"];

const deckAttributes = ref<
	Array<Database["public"]["Tables"]["deck_attribute_type"]["Row"]>
>([]);

const { cards: editedCards } = useCards(deckId);

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

async function saveCards() {
	console.log("saving cards", editedCards);
	if (Number.isNaN(deckId)) {
		return;
	}
	const attributes: (typeof editedCards.value)[number]["card_attribute_value"] =
		[];
	try {
		// remove the id field from cards that haven't been saved to the database
		// they are the cards that have negative ids
		const cardsToSave = editedCards.value.map((card) => {
			if (card.id === undefined) {
				throw Error(`card missing id ${card.front_content}`);
			}
			if (card.id < 0) {
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

			const { card_attribute_value, ...cardWithoutAttributes } = card;
			/* eslint-enable @typescript-eslint/no-unused-vars */

			card_attribute_value.forEach((value) => {
				attributes.push({ ...value });
			});

			return cardWithoutAttributes;
		});
		console.log("saving cards", cardsToSave);
		const { data, error } = await supabase.from("card").upsert(cardsToSave, {
			defaultToNull: false,
		});

		const attributesToSave = attributes.map((attribute) => {
			if (attribute.id === undefined) {
				throw Error(`attribute missing id ${attribute}`);
			}
			if (attribute.id < 0) {
				/* eslint-disable @typescript-eslint/no-unused-vars */
				const { id, created_at, deck_attribute_type, ...attributeWithoutId } =
					attribute;
				return attributeWithoutId;
			}
			const { deck_attribute_type, ...attributeWithoutDeckAttribute } =
				attribute;
			/* eslint-enable @typescript-eslint/no-unused-vars */

			return attributeWithoutDeckAttribute;
		});

		console.log("saved cards", data);

		console.log("saving attributes", attributesToSave);

		const { data: attributeSaveData, error: attributeSaveError } =
			await supabase.from("card_attribute_value").upsert(attributesToSave, {
				defaultToNull: false,
			});
		console.log("attribute save data", attributeSaveData);
		console.log("attribute save error", attributeSaveError);

		if (error) {
			console.error("Error saving cards:", error);
		}
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

function handleNewCardClick() {
	// use negative numbers to differentiate from cards that have been saved.
	// those cards will have a generated id which will be positive
	const id = -performance.now();
	console.log("new card", id);

	editedCards.value.push({
		id: id,
		created_at: "",
		notes: "",
		updated_at: "",
		deck_id: deckId,
		front_content: "",
		display_order: editedCards.value.length,
		card_attribute_value: [],
	});
}

function handleSaveClick() {
	saveCards();
}
</script>

<template>
	<main>
		<h1>Deck Editor</h1>
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
		<div>
			<div v-for="deckAttribute in deckAttributes" :key="deckAttribute.id">
				{{ deckAttribute.attribute_name }} - {{ deckAttribute.attribute_type }}
			</div>
		</div>
		<h2>Cards</h2>
		<button @click="handleSaveClick">Save Cards</button>
		<div class="cards">
			<div v-for="card in editedCards" :key="card.id" class="card">
				<label>Front</label>
				<textarea class="front-content" v-model="card.front_content"></textarea>
				<template
					v-for="attribute in card.card_attribute_value"
					:key="attribute?.id"
				>
					<label>{{ attribute?.deck_attribute_type.attribute_name }}</label>
					<textarea v-model="attribute.value"></textarea>
				</template>
			</div>
			<button @click="handleNewCardClick">New Card</button>
		</div>
	</main>
</template>

<style scoped>
main {
	max-width: 800px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: 0 auto;
	gap: 1rem;

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		grid-gap: 1rem;
		grid-auto-flow: dense;

		.card {
			border: 1px solid blue;
		}
	}

	button {
		background-color: rgb(43, 86, 175);
		width: 256px;
		color: white;
		cursor: pointer;
	}
}
</style>
