<script setup lang="ts">
import { ref } from "vue";
import DeckEditor from "./DeckEditor.vue";

const editingDeck = ref(false);

function handleEditDeckClick() {
  console.log("edit");
  editingDeck.value = true;
}
</script>

<template>
  <h1>Deck Viewer</h1>
  <main>{{ $route.params.id }}</main>
  <button @click="handleEditDeckClick">Edit Deck</button>
  <DeckEditor v-if="editingDeck" />
</template>

<style></style>
