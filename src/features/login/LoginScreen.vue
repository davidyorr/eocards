<script setup lang="ts">
import { useRouter } from "vue-router";
import { supabase } from "../../utils/supabase";
import { ref } from "vue";
import eocardsLogo from "@/assets/eocards-logo.svg";

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
</script>

<template>
	<div class="content">
		<img :src="eocardsLogo" alt="Eocards Logo" class="logo" />
		<input id="email" v-model="email" placeholder="email" />
		<input
			id="password"
			v-model="password"
			placeholder="password"
			type="password"
		/>
		<button @click="handleLoginButtonClick">Log In</button>
		<p id="error-message">{{ errorMessage }}</p>
	</div>
</template>

<style scoped>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 0 auto;

	gap: 12px;
	max-width: 512px;

	.logo {
		margin-top: 12px;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 256px;
	}

	input {
		width: 100%;
	}

	button {
		width: 100%;
		color: black;
		background-color: var(--primary);
	}

	#error-message {
		color: var(--error-message-color);
	}
}
</style>
