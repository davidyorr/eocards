<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useCards } from "./useCards";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));
const { cards } = useCards(deckId);
const currentCardIndex = ref(0);

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
