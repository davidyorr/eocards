<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useCards } from "./useCards";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));
const { cards, loading } = useCards(deckId);
const currentCardIndex = ref(0);
const viewingFront = ref(true);
// delay showing empty card content to avoid flicker on fast loads
const showEmptyCardContent = ref(false);
const progressText = computed(() => {
	return `${currentCardIndex.value + 1} / ${cards.value.length}`;
});

onMounted(() => {
	setTimeout(() => {
		showEmptyCardContent.value = true;
	}, 500);
});

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
	<!-- if there are cards, always show them immediately -->
	<div class="cards" v-if="cards.length > 0">
		<article class="card-content">
			<span class="progress-indicator">{{ progressText }}</span>
			<div class="controls">
				<div class="prev-button" @click="handlePreviousClick"></div>
				<div class="flip-button" @click="handleFlipClick"></div>
				<div class="next-button" @click="handleNextClick"></div>
			</div>
			<div class="main-content" data-testid="card-text">
				{{
					viewingFront
						? cards[currentCardIndex].front_content
						: cards[currentCardIndex].card_attribute_value[0].value
				}}
			</div>
		</article>
	</div>

	<!-- otherwise show the empty card container -->
	<div class="empty-card-container" v-else>
		<article class="card-content">
			<div class="main-content">
				<!-- if the delay has passed, show either the loader or the no cards message -->
				<div class="loader" v-if="showEmptyCardContent && loading"></div>
				<div v-else-if="showEmptyCardContent && !loading">
					No cards in this deck.
				</div>
			</div>
		</article>
	</div>
</template>

<style scoped>
.loader {
	width: 1.4em;
	height: 1.4em;
	border: 0.13em solid var(--pico-color);
	border-top-color: var(--pico-primary-background);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.cards,
.empty-card-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;

	.card-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		height: 80%;
		align-content: center;

		.main-content {
			display: flex;
			font-size: 3rem;
			justify-content: center;
		}

		.progress-indicator {
			position: absolute;
			top: 0;
			right: 0;
			line-height: 1;
			padding: 0.5rem;
		}

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
