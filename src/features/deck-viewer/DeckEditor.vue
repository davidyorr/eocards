<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "../../utils/supabase";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

type AttributeType = Database["public"]["Enums"]["attribute_type"];

const newAttributeName = ref("");
const newAttributeType = ref<AttributeType>("text");

const attributeTypeOptions: Array<AttributeType> = ["text", "image"];

const deckAttributes = ref<
  Array<Database["public"]["Tables"]["deck_attribute_type"]["Row"]>
>([]);

onMounted(() => {
  fetchAttributeTypes();
});

async function fetchAttributeTypes() {
  console.log("fetching attribute types");
  const deckId = Number.parseInt(String(route.params.id));
  if (Number.isNaN(deckId)) {
    return;
  }
  try {
    const { data, error } = await supabase
      .from("deck_attribute_type")
      .select()
      .eq("deck_id", deckId);

    if (error) {
      console.error("Error fetching attribute types:", error);
      return;
    }
    console.log("fetched attribute types", data);

    deckAttributes.value = data;
  } catch (error) {
    console.error("Error fetching attribute types:", error);
  }
}

async function handleAddAttributeClick() {
  if (newAttributeName.value === "") {
    return;
  }
  const deckId = Number.parseInt(String(route.params.id));
  if (Number.isNaN(deckId)) {
    return;
  }
  const response = await supabase.from("deck_attribute_type").insert({
    attribute_name: newAttributeName.value,
    deck_id: deckId,
    display_order: deckAttributes.value.length + 1,
  });

  console.log(response);

  newAttributeName.value = "";
  newAttributeType.value = "text";
  fetchAttributeTypes();
}
</script>

<template>
  <h1>Deck Editor</h1>
  <main>{{ $route.params.id }}</main>
  <h2>Attributes</h2>
  <div>
    <input v-model="newAttributeName" placeholder="name" />
    <select v-model="newAttributeType">
      <option
        v-for="attributeTypeOption in attributeTypeOptions"
        :key="attributeTypeOption"
      >
        {{ attributeTypeOption }}
      </option>
    </select>
    <button @click="handleAddAttributeClick">Add Attribute</button>
  </div>
  <div>
    <div v-for="deckAttribute in deckAttributes" :key="deckAttribute.id">
      {{ deckAttribute.attribute_name }} - {{ deckAttribute.attribute_type }}
    </div>
  </div>
</template>

<style></style>
