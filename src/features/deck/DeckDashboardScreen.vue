<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

function handleReviewButtonClick() {
	router.push(`/deck/review/${route.params.id}`);
}

function handleEditButtonClick() {
	router.push(`/deck/edit/${route.params.id}`);
}
</script>

<template>
	<main>
		<h1>Deck Dashboard Screen</h1>
		<button @click="handleReviewButtonClick">Review</button>
		<button @click="handleEditButtonClick">Edit</button>
	</main>
</template>

<style scoped>
main {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
	gap: 1rem;

	button {
		width: 256px;
		font-size: 1.25rem;
		line-height: 3rem;
		background-color: rgb(43, 86, 175);
		color: white;
		cursor: pointer;
	}
}
</style>
