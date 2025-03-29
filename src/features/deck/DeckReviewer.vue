<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useCards } from "./useCards";
import { useDeck } from "./useDeck";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));
const { deck } = useDeck(deckId);
const { cards } = useCards(deckId);
const currentCardIndex = ref(0);
const viewingFront = ref(true);

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

function handleCardClick() {
	viewingFront.value = !viewingFront.value;
}
</script>

<template>
	<h1>Deck Reviewer {{ deck?.name }}</h1>
	<div class="cards" v-if="cards.length > 0">
		<button @click="handlePreviousClick">prev</button>
		<article class="card-content" @click="handleCardClick">
			{{
				viewingFront
					? cards[currentCardIndex].front_content
					: cards[currentCardIndex].card_attribute_value[0].value
			}}
		</article>
		<button @click="handleNextClick">next</button>
	</div>
	<h2 v-else>no cards</h2>
</template>

<style scoped>
.cards {
	height: 100%;

	.card-content {
		background-color: var(--card-background-color);
		box-shadow: rgba(100, 100, 111, 0.2) 0px 0px 30px 0px;
		height: 80%;
		font-size: 3rem;
		align-content: center;
	}
}
</style>
