<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import Settings from "./Settings.vue";
import {
	HomeIcon,
	UserIcon,
	EditIcon,
	PlayCircleIcon as ReviewIcon,
	SettingsIcon,
	LogOutIcon,
} from "lucide-vue-next";
import { ref } from "vue";
import { supabase } from "@/utils/supabase";
import { useRoute, useRouter } from "vue-router";

const userOptionsMenuVisibility = ref(false);
const userSettingsModalVisibility = ref(false);

const route = useRoute();
const router = useRouter();

function handleHomeIconClick() {
	router.push("/");
}

function handleUserIconClick() {
	userOptionsMenuVisibility.value = !userOptionsMenuVisibility.value;
}

async function handleLogoutClick() {
	const response = await supabase.auth.signOut();
	console.log(response);
	userStore.reset();
	userOptionsMenuVisibility.value = false;
	router.push("/login");
}

async function handleSettingsClick() {
	userOptionsMenuVisibility.value = false;
	userSettingsModalVisibility.value = true;
}

async function handleSettingsClose() {
	userSettingsModalVisibility.value = false;
}

function handleEditIconClick() {
	router.push(`/deck/edit/${route.params.id}`);
}

function handleReviewIconClick() {
	router.push(`/deck/review/${route.params.id}`);
}
</script>

<template>
	<nav>
		<HomeIcon
			v-if="userStore.user !== null"
			:size="24"
			color="var(--primary)"
			@click="handleHomeIconClick"
		/>
		<EditIcon
			v-if="$route.path.includes('/deck/review')"
			:size="24"
			color="var(--primary)"
			@click="handleEditIconClick"
		/>
		<ReviewIcon
			v-if="$route.path.includes('/deck/edit')"
			:size="24"
			color="var(--primary)"
			@click="handleReviewIconClick"
			data-testid="review-deck"
		/>
		<div v-if="userStore.user !== null" class="user-options-container">
			<UserIcon
				:size="24"
				color="var(--primary)"
				@click="handleUserIconClick"
			/>
			<div v-if="userOptionsMenuVisibility" class="user-options">
				<div class="preferences row" @click="handleSettingsClick">
					<span>Settings</span>
					<SettingsIcon :size="24" />
				</div>
				<div class="logout row" @click="handleLogoutClick">
					<span>Log out</span>
					<LogOutIcon :size="24" />
				</div>
			</div>
		</div>
		<Settings v-if="userSettingsModalVisibility" @close="handleSettingsClose" />
	</nav>
</template>

<style scoped>
nav {
	&& {
		display: flex;
		gap: 24px;
	}
	position: sticky;
	top: 0;
	padding-top: var(--safe-area-top);
	height: calc(var(--navbar-height) + var(--safe-area-top));
	width: 100%;

	align-items: center;
	justify-content: center;

	background-color: rgb(52, 58, 64);
	box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
	color: rgb(255, 255, 255);

	z-index: 100;

	svg {
		cursor: pointer;
		width: 24px;
		height: 24px;
	}

	.user-options-container {
		display: flex;
		position: relative;
		align-items: center;
		height: 100%;

		.user-options {
			position: absolute;
			display: flex;
			flex-direction: column;
			white-space: nowrap;
			top: var(--navbar-height);
			right: 0;
			background-color: rgb(52, 58, 64);

			.row {
				cursor: pointer;
				display: flex;
				justify-content: center;
				gap: 8px;
				padding: 12px 16px;
				width: 100%;
				align-items: center;
			}
		}
	}
}
</style>
