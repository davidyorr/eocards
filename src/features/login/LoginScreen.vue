<script setup lang="ts">
import { useRouter } from "vue-router";
import { supabase } from "../../utils/supabase";
import { ref } from "vue";

const router = useRouter();

const email = ref("");
const password = ref("");
const errorMessage = ref("");

async function handleLoginButtonClick() {
	const response = await supabase.auth.signInWithPassword({
		email: email.value,
		password: password.value,
	});

	console.log(response);

	if (response.data.user !== null) {
		router.push("/");
	}

	if (response.error !== null) {
		errorMessage.value = response.error.message;
	}
}

async function handleLogoutButtonClick() {
	const response = await supabase.auth.signOut();
	console.log(response);
}
</script>

<template>
	<h1>Login</h1>
	<main>
		<input id="email" v-model="email" placeholder="email" />
		<input
			id="password"
			v-model="password"
			placeholder="password"
			type="password"
		/>
		<button @click="handleLoginButtonClick">Login</button>
		<button @click="handleLogoutButtonClick">Logout</button>
		<p id="error-message">{{ errorMessage }}</p>
	</main>
</template>

<style>
#error-message {
	color: var(--error-message-color);
}
</style>
