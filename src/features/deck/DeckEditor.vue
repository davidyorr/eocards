<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "../../utils/supabase";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));

type AttributeType = Database["public"]["Enums"]["attribute_type"];

const newAttributeName = ref("");
const newAttributeType = ref<AttributeType>("text");

const attributeTypeOptions: Array<AttributeType> = ["text", "image"];

const deckAttributes = ref<
	Array<Database["public"]["Tables"]["deck_attribute_type"]["Row"]>
>([]);

// type NewCard = {
// 	id: number;
// 	deck_id: number;
// 	front_content: string;
// 	display_order: number;
// 	card_attribute_value: {
// 		id: number;
// 		card_id: number;
// 		deck_attribute_type_id: number;
// 		value: string;
// 	}[];
// };
type NewCard = Pick<
	Database["public"]["Tables"]["card"]["Row"],
	"id" | "deck_id" | "front_content" | "display_order"
> & {
	card_attribute_value: Array<
		Pick<
			Database["public"]["Tables"]["card_attribute_value"]["Row"],
			"id" | "card_id" | "deck_attribute_type_id" | "value"
		>
	>;
};
type CardWithAttributes = Database["public"]["Tables"]["card"]["Row"] & {
	card_attribute_value: Array<
		Database["public"]["Tables"]["card_attribute_value"]["Row"]
	>;
};
const fetchedCards = ref<Array<CardWithAttributes>>([]);
const editedCards = ref<Array<CardWithAttributes | NewCard>>([]);

onMounted(() => {
	fetchAttributeTypes();
	fetchCards();
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

async function fetchCards() {
	console.log("fetching cards");
	if (Number.isNaN(deckId)) {
		return;
	}
	try {
		const { data, error } = await supabase
			.from("card")
			.select(
				`
				*,
				card_attribute_value (
					*,
					deck_attribute_type (
						attribute_name
					)
				)
			`,
			)
			.eq("deck_id", deckId)
			.order("display_order");

		if (error) {
			console.error("Error fetching cards:", error);
			return;
		}
		console.log("fetched cards", data);

		fetchedCards.value = data;
		editedCards.value = data;
	} catch (error) {
		console.error("Error fetching cards:", error);
	}
}

async function saveCards() {
	console.log("saving cards");
	if (Number.isNaN(deckId)) {
		return;
	}
	try {
		// remove the id field from cards that haven't been saved to the database
		// they are the cards that have negative ids
		const cardsToSave = editedCards.value.map((card) => {
			if (card.id === undefined) {
				throw Error(`card missing id ${card.front_content}`);
			}
			if (card.id < 0) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { id, ...cardWithoutId } = card;
				return cardWithoutId;
			}

			return card;
		});
		const { data, error } = await supabase.from("card").upsert(cardsToSave, {
			defaultToNull: false,
		});

		console.log("saved cards", data);

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

	// const cardAttributeValue: NewCard["card_attribute_value"] = [];

	// editedCards.value.push({
	// 	id: id,
	// 	deck_id: deckId,
	// 	front_content: "",
	// 	display_order: editedCards.value.length,
	// 	// card_attribute_value: [],
	// });
}

function handleSaveClick() {
	saveCards();
}
</script>

<template>
	<h1>Deck Editor</h1>
	<main>{{ $route.params.id }}</main>
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
				:key="attribute.id"
			>
				<label>{{ attribute.id }}</label>
				<textarea v-model="attribute.value"></textarea>
			</template>
			<!-- loop through editedCards.cardAttributeValue -->
		</div>
		<button @click="handleNewCardClick">New Card</button>
	</div>
</template>

<style scoped>
.cards {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	grid-gap: 1rem;
	grid-auto-flow: dense;

	.card {
		border: 1px solid blue;
	}
}
</style>
