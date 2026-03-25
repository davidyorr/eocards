<script setup lang="ts">
import { Database } from "@/database.types";
import { ref, onMounted } from "vue";
import { supabase } from "@/utils/supabase";
import { notificationsStore } from "@/stores/notificationsStore";

type Settings = {
	dark_mode: boolean;
};

const DEFAULT_SETTINGS: Settings = {
	dark_mode: false,
};

const emit = defineEmits<{ (e: "close"): void }>();

const userPreferences = ref<
	Database["public"]["Tables"]["user"]["Row"] | null
>();

const loading = ref(true);

function underscoreToDisplayName(str: string) {
	return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function getInputType(value: unknown): string {
	if (typeof value === "boolean") return "checkbox";
	if (typeof value === "number") return "number";
	return "text";
}

async function handleSaveClick() {
	if (userPreferences.value?.preferences) {
		const { error } = await supabase
			.from("user")
			.update({ preferences: userPreferences.value.preferences })
			.eq("id", userPreferences.value.id);

		if (!error) {
			notificationsStore.queueNotification({
				message: "Settings saved",
				type: "SUCCESS",
			});
			emit("close");
		}
	}
}

onMounted(async () => {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		const { data } = await supabase
			.from("user")
			.select()
			.eq("user_id", user.id)
			.single();

		if (data) {
			userPreferences.value = data;
		} else {
			const { data: inserted } = await supabase
				.from("user")
				.insert({ preferences: DEFAULT_SETTINGS, user_id: user.id })
				.select()
				.single();
			userPreferences.value = inserted;
		}

		loading.value = false;
	}
});
</script>

<template>
	<BaseModal title="Settings" @close="emit('close')">
		<div v-if="userPreferences">
			<ModalRow
				v-for="(value, name) in userPreferences.preferences"
				:key="name"
				:label="underscoreToDisplayName(name as string)"
				description="Toggle this user preference"
			>
				<input
					v-if="typeof value === 'boolean'"
					type="checkbox"
					v-model="
						(userPreferences.preferences as Record<string, unknown>)[
							name as string
						]
					"
					role="switch"
				/>
				<input
					v-else
					:type="getInputType(value)"
					v-model="
						(userPreferences.preferences as Record<string, unknown>)[
							name as string
						]
					"
				/>
			</ModalRow>
		</div>

		<template #footer>
			<button class="btn-base btn-cancel" @click="emit('close')">Cancel</button>
			<button class="btn-base btn-apply" @click="handleSaveClick">Save</button>
		</template>
	</BaseModal>
</template>
