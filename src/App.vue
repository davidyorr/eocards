<script setup lang="ts">
import NavigationBar from "./features/navbar/NavigationBar.vue";
</script>

<template>
	<NavigationBar />
	<main class="content">
		<router-view></router-view>
	</main>
</template>

<style>
#app {
	height: 100vh;
	height: 100dvh;

	.content {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 24px;
		height: calc(100% - var(--navbar-height));
	}
}
</style>
