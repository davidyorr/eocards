<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "@/utils/supabase";
import { onMounted, ref, useTemplateRef } from "vue";

type Settings = {
	dark_mode: boolean;
};

const DEFAULT_SETTINGS: Settings = {
	dark_mode: false,
};

const emit = defineEmits<{
	(event: "close"): void;
}>();

const modalOverlay = useTemplateRef("modal-overlay");

const userPreferences = ref<
	Database["public"]["Tables"]["user"]["Row"] | null
>();

const checkedNames = ref<Array<string>>([]);

function underscoreToDisplayName(str: string) {
	return str
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function handleOverlayClick(event: Event) {
	if (event.target === modalOverlay.value) {
		emit("close");
	}
}

async function handleSaveClick() {
	if (userPreferences.value?.preferences) {
		const response = await supabase
			.from("user")
			.update({
				preferences: userPreferences.value.preferences,
			})
			.eq("id", userPreferences.value.id)
			.select();
		console.log("save preferences response", response);
	}
}

async function fetchPreferences(userId: string) {
	return await supabase.from("user").select().eq("user_id", userId).single();
}

onMounted(async () => {
	const user = await supabase.auth.getUser();
	if (user.data.user?.id) {
		const preferencesResponse = await fetchPreferences(user.data.user.id);
		console.log("preferences", preferencesResponse.data);
		if (preferencesResponse.data) {
			userPreferences.value = preferencesResponse.data;
		} else {
			// if no settings exist, insert the default preferences for this user
			const response = await supabase
				.from("user")
				.insert({
					preferences: DEFAULT_SETTINGS,
					user_id: user.data.user.id,
				})
				.select()
				.single();
			console.log("insert response", response);
			userPreferences.value = response.data;
		}
	}
	checkedNames.value = Object.entries(userPreferences.value?.preferences ?? {})
		.filter(([_, value]) => value)
		.map(([name]) => {
			return name;
		});
});
</script>

<template>
	<div class="modal-overlay" ref="modal-overlay" @click="handleOverlayClick">
		<div class="modal">
			<h1>Settings</h1>
			<div
				v-for="[name, value] in Object.entries(
					userPreferences?.preferences ?? {},
				)"
				:key="name"
			>
				<input
					type="checkbox"
					:checked="value"
					:value="name"
					v-model="checkedNames"
				/>
				<label>{{ underscoreToDisplayName(name) }}</label>
			</div>
			<button @click="handleSaveClick">Save</button>
		</div>
	</div>
</template>

<style scoped>
.modal-overlay {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
	background-color: rgba(0, 0, 0, 0.2);

	.modal {
		position: relative;
		max-width: 400px;
		width: 90%;
		min-height: 200px;
		z-index: 1001;
		padding: 24px;
		background-color: white;
		color: black;
	}
}
</style>
