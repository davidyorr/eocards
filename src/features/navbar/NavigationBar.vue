<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import Settings from "./Settings.vue";
import HomeIcon from "~icons/qlementine-icons/home-16";
import UserIcon from "~icons/qlementine-icons/user-16";
import EditIcon from "~icons/qlementine-icons/pen-16";
import ReviewIcon from "~icons/qlementine-icons/preview-16";
import SettingsIcon from "~icons/qlementine-icons/settings-16";
import LogOutIcon from "~icons/hugeicons/logout-01";
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
		<HomeIcon v-if="userStore.user !== null" @click="handleHomeIconClick" />
		<EditIcon
			v-if="$route.path.includes('/deck/review')"
			@click="handleEditIconClick"
		/>
		<ReviewIcon
			v-if="$route.path.includes('/deck/edit')"
			@click="handleReviewIconClick"
			data-testid="review-deck"
		/>
		<div v-if="userStore.user !== null" class="user-options-container">
			<UserIcon @click="handleUserIconClick" />
			<div v-if="userOptionsMenuVisibility" class="user-options">
				<div class="preferences row" @click="handleSettingsClick">
					<span>Settings</span>
					<SettingsIcon />
				</div>
				<div class="logout row" @click="handleLogoutClick">
					<span>Log out</span>
					<LogOutIcon />
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
		gap: 8px;
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
	}

	.user-options-container {
		display: flex;
		position: relative;

		.user-options {
			position: absolute;
			display: flex;
			flex-direction: column;
			white-space: nowrap;
			top: 27px;
			right: 0;
			background-color: rgb(52, 58, 64);

			.row {
				cursor: pointer;
				display: flex;
				justify-content: center;
				gap: 8px;
				padding: 4px 12px;
				width: 100%;
			}
		}
	}
}
</style>
