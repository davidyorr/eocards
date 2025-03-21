<script setup lang="ts">
import { supabase } from "../../utils/supabase";
import { ref } from "vue";

const email = ref("");
const password = ref("");

async function handleLoginButtonClick() {
  const response = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  console.log(response);
}

async function handleLogoutButtonClick() {
  const response = await supabase.auth.signOut();
  console.log(response);
}
</script>

<template>
  <h1>login</h1>
  <main>
    <input id="email" v-model="email" />
    <input id="password" v-model="password" type="password" />
    <button @click="handleLoginButtonClick">Login</button>
    <button @click="handleLogoutButtonClick">Logout</button>
  </main>
</template>

<style></style>
