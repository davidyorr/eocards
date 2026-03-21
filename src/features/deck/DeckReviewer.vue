<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useCards } from "./useCards";

const route = useRoute();
const deckId = Number.parseInt(String(route.params.id));
const { cards, loading } = useCards(deckId);
const currentCardIndex = ref(0);
// -1 = front, 0..N-1 = attribute index
const attributeIndex = ref(-1);
const showEmptyCardContent = ref(false);

const progressText = computed(() => {
	return `${currentCardIndex.value + 1} / ${cards.value.length}`;
});

const currentCard = computed(() => cards.value[currentCardIndex.value]);

const currentContent = computed(() => {
	if (attributeIndex.value === -1)
		return currentCard.value?.front_content ?? "";
	return (
		currentCard.value?.card_attribute_value[attributeIndex.value]?.value ?? ""
	);
});

const currentAttributeName = computed(() => {
	if (attributeIndex.value === -1) return "Front";
	return (
		currentCard.value?.card_attribute_value[attributeIndex.value]
			?.deck_attribute_type?.attribute_name ?? null
	);
});

// e.g. "● ○ ○" dots showing front + each attribute
const flipDots = computed(() => {
	if (!currentCard.value) return "";
	const total = 1 + currentCard.value.card_attribute_value.length;
	return Array.from({ length: total }, (_, i) =>
		i === attributeIndex.value + 1 ? "●" : "○",
	).join(" ");
});

onMounted(() => {
	setTimeout(() => {
		showEmptyCardContent.value = true;
	}, 500);
});

function resetCard() {
	attributeIndex.value = -1;
}

function handlePreviousClick() {
	resetCard();
	currentCardIndex.value =
		currentCardIndex.value === 0
			? cards.value.length - 1
			: currentCardIndex.value - 1;
}

function handleNextClick() {
	resetCard();
	currentCardIndex.value =
		currentCardIndex.value === cards.value.length - 1
			? 0
			: currentCardIndex.value + 1;
}

function handleFlipClick() {
	if (!currentCard.value) return;
	const attrCount = currentCard.value.card_attribute_value.length;
	// cycle: front (-1) → attr 0 → attr 1 → … → attr N-1 → front (-1)
	attributeIndex.value =
		attributeIndex.value < attrCount - 1 ? attributeIndex.value + 1 : -1;
}
</script>

<template>
	<div class="cards" v-if="cards.length > 0">
		<article class="card-content">
			<span class="progress-indicator">{{ progressText }}</span>
			<div class="controls">
				<div class="prev-button" @click.stop="handlePreviousClick"></div>
				<div class="next-button" @click.stop="handleNextClick"></div>
			</div>

			<div
				class="main-content"
				data-testid="card-text"
				@click="handleFlipClick"
			>
				{{ currentContent }}
			</div>

			<span class="flip-dots">{{ flipDots }}</span>
			<div class="attribute-label" v-if="currentAttributeName">
				{{ currentAttributeName }}
			</div>
		</article>
	</div>

	<div class="empty-card-container" v-else>
		<article class="card-content">
			<div class="main-content">
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
	width: 100%;

	.card-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		height: 80%;
		width: 100%;
		align-content: center;
		border-radius: 16px;

		.main-content {
			display: flex;
			font-size: 3rem;
			justify-content: center;
			text-align: center;
			align-items: center;
			width: 100%;
			padding: 24px;
			overflow-y: auto;
			height: 100%;
		}

		.progress-indicator {
			position: absolute;
			top: 0;
			right: 0;
			line-height: 1;
			padding: 0.5rem;
			pointer-events: none;
		}

		.flip-dots {
			position: absolute;
			/* top: 0; */
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			font-size: 0.7rem;
			letter-spacing: 0.2em;
			padding: 0.5rem;
			pointer-events: none;
			color: var(--pico-muted-color, currentColor);
			opacity: 0.5;
		}

		.attribute-label {
			position: absolute;
			bottom: 1rem;
			left: 50%;
			transform: translateX(-50%);
			font-size: 1rem;
			text-align: center;
			padding: 0.75rem;
			pointer-events: none;
			opacity: 0.55;
			white-space: nowrap;
		}

		.controls {
			position: absolute;
			display: flex;
			justify-content: space-between;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			pointer-events: none;

			.prev-button,
			.next-button {
				pointer-events: auto;
				height: 100%;
				width: 25%;
			}
		}
	}

	@media (max-width: 768px) {
		.cards,
		.empty-card-container {
			justify-content: flex-start;
		}

		.card-content {
			height: 100%;
			background-color: transparent;
			border-radius: 0;
		}
	}
}
</style>
