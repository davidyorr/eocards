<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "../../utils/supabase";
import { onMounted, ref } from "vue";

const newDeckName = ref("");
const createNewDeckVisibility = ref(false);
const decks = ref<Array<Database["public"]["Tables"]["deck"]["Row"]>>([]);

onMounted(() => {
  fetchDecks();
});

async function fetchDecks() {
  console.log("fetching decks");
  try {
    const { data, error } = await supabase.from("deck").select();

    if (error) {
      console.error("Error fetching decks:", error);
      return;
    }
    console.log("fetched decks", data);

    decks.value = data;
  } catch (error) {
    console.error("Error fetching decks:", error);
  }
}

function handleNewDeckClick() {
  createNewDeckVisibility.value = true;
}

async function handleCreateDeckClick() {
  if (newDeckName.value === "") {
    return;
  }
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (userId) {
    const response = await supabase.from("deck").insert({
      name: newDeckName.value,
      user_id: userId,
    });
    // response.status === 201
    console.log(response);

    createNewDeckVisibility.value = false;
    fetchDecks();
  }
}
</script>

<template>
  <h1>Home</h1>
  <main>
    <button @click="handleNewDeckClick">New Deck</button>
    <div v-show="createNewDeckVisibility">
      <input placeholder="name" v-model="newDeckName" />
      <button @click="handleCreateDeckClick">Create Deck</button>
    </div>
    <div>
      <div v-for="deck in decks" :key="deck.id">
        {{ deck.name }}
      </div>
    </div>
  </main>
</template>

<style></style>
