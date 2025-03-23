<script setup lang="ts">
import { ref } from "vue";
import DeckEditor from "./DeckEditor.vue";
import DeckReviewer from "./DeckReviewer.vue";

const studyingDeck = ref(false);
const editingDeck = ref(false);

function handleStudyDeckClick() {
  studyingDeck.value = true;
}

function handleEditDeckClick() {
  console.log("edit");
  editingDeck.value = true;
}
</script>

<template>
  <h1>Deck Viewer</h1>
  <main>{{ $route.params.id }}</main>
  <button @click="handleStudyDeckClick">Study Deck</button>
  <button @click="handleEditDeckClick">Edit Deck</button>
  <DeckEditor v-if="editingDeck" />
  <DeckReviewer v-if="studyingDeck" />
</template>

<style></style>
