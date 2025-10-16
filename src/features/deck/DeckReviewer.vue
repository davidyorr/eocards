<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useCards } from "./useCards";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));
const { cards } = useCards(deckId);
const currentCardIndex = ref(0);
const viewingFront = ref(true);

function handlePreviousClick() {
	viewingFront.value = true;

	if (currentCardIndex.value === 0) {
		currentCardIndex.value = cards.value.length - 1;
	} else {
		currentCardIndex.value = currentCardIndex.value - 1;
	}
}

function handleNextClick() {
	viewingFront.value = true;

	if (currentCardIndex.value === cards.value.length - 1) {
		currentCardIndex.value = 0;
	} else {
		currentCardIndex.value = currentCardIndex.value + 1;
	}
}

function handleFlipClick() {
	viewingFront.value = !viewingFront.value;
}
</script>

<template>
	<div class="cards" v-if="cards.length > 0">
		<article class="card-content">
			<div class="controls">
				<div class="prev-button" @click="handlePreviousClick"></div>
				<div class="flip-button" @click="handleFlipClick"></div>
				<div class="next-button" @click="handleNextClick"></div>
			</div>
			{{
				viewingFront
					? cards[currentCardIndex].front_content
					: cards[currentCardIndex].card_attribute_value[0].value
			}}
		</article>
	</div>
	<h2 v-else>no cards</h2>
</template>

<style scoped>
.cards {
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;

	.card-content {
		position: relative;
		height: 80%;
		font-size: 3rem;
		align-content: center;
		text-align: center;

		.controls {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;

			display: grid;
			grid-template-columns: 25% 50% 25%;
		}
	}
}
</style>
