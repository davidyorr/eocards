<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import HomeIcon from "~icons/qlementine-icons/home-16";
import UserIcon from "~icons/qlementine-icons/user-16";
import EditIcon from "~icons/qlementine-icons/pen-16";
import ReviewIcon from "~icons/qlementine-icons/preview-16";
import LogOutIcon from "~icons/hugeicons/logout-01";
import { ref } from "vue";
import { supabase } from "@/utils/supabase";
import { useRoute, useRouter } from "vue-router";

const userOptionsVisibility = ref(false);

const route = useRoute();
const router = useRouter();

function handleHomeIconClick() {
	router.push("/");
}

function handleUserIconClick() {
	userOptionsVisibility.value = !userOptionsVisibility.value;
}

async function handleLogoutClick() {
	const response = await supabase.auth.signOut();
	console.log(response);
	userStore.reset();
	userOptionsVisibility.value = false;
	router.push("/login");
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
		<HomeIcon @click="handleHomeIconClick" />
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
			<div v-if="userOptionsVisibility" class="user-options">
				<div class="logout" @click="handleLogoutClick">
					<span>Log out</span>
					<LogOutIcon />
				</div>
			</div>
		</div>
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
	height: var(--navbar-height);
	width: 100%;
	align-items: center;
	justify-content: center;

	background-color: rgb(52, 58, 64);
	box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
	color: rgb(255, 255, 255);

	svg {
		cursor: pointer;
	}

	.user-options-container {
		display: flex;
		position: relative;

		.user-options {
			position: absolute;
			display: flex;
			white-space: nowrap;
			top: 27px;
			right: 0;
			padding: 0 8px;
			background-color: rgb(52, 58, 64);

			.logout {
				cursor: pointer;
			}
		}
	}
}
</style>
