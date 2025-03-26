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
	<h1>Deck Dashboard Screen</h1>
	<button @click="handleReviewButtonClick">Review</button>
	<button @click="handleEditButtonClick">Edit</button>
</template>

<style scoped></style>
