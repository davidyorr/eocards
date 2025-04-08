<script setup lang="ts">
import { userStore } from "@/stores/userStore";
</script>

<template>
	<nav>
		Navbar
		<span>{{ userStore.user?.email }}</span>
	</nav>
</template>

<style>
nav {
	position: sticky;
	top: 0;
	height: var(--navbar-height);
	width: 100%;

	box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
	align-content: center;
}
</style>
