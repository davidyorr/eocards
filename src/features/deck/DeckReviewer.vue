<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "@/utils/supabase";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));

const cards = ref<Array<Database["public"]["Tables"]["card"]["Row"]>>([]);

const currentCardIndex = ref(0);

onMounted(() => {
	fetchCards();
});

async function fetchCards() {
	console.log("fetching cards");
	if (Number.isNaN(deckId)) {
		return;
	}
	try {
		const { data, error } = await supabase
			.from("card")
			.select()
			.eq("deck_id", deckId)
			.order("display_order");

		if (error) {
			console.error("Error fetching cards:", error);
			return;
		}
		console.log("fetched cards", data);

		cards.value = data;
	} catch (error) {
		console.error("Error fetching cards:", error);
	}
}

function handlePreviousClick() {
	if (currentCardIndex.value === 0) {
		currentCardIndex.value = cards.value.length - 1;
	} else {
		currentCardIndex.value = currentCardIndex.value - 1;
	}
}

function handleNextClick() {
	if (currentCardIndex.value === cards.value.length - 1) {
		currentCardIndex.value = 0;
	} else {
		currentCardIndex.value = currentCardIndex.value + 1;
	}
}
</script>

<template>
	<h1>Deck Reviewer</h1>
	<div class="cards" v-if="cards.length > 0">
		<button @click="handlePreviousClick">prev</button>
		<article class="card-content">
			{{ cards[currentCardIndex].front_content }}
		</article>
		<button @click="handleNextClick">next</button>
	</div>
	<h2 v-else>no cards</h2>
</template>

<style scoped>
.cards {
	.card-content {
		border: 1px solid blue;
		height: 200px;
	}
}
</style>
