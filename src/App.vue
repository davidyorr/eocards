<script setup lang="ts">
import NavigationBar from "./features/navbar/NavigationBar.vue";
import ToastNotifications from "./features/notifications/ToastNotifications.vue";
</script>

<template>
	<NavigationBar />
	<main>
		<router-view></router-view>
	</main>
	<ToastNotifications />
</template>

<style>
#app {
	height: 100vh;
	height: 100dvh;

	main {
		max-width: 1280px;
		margin: 0 auto;
		padding-left: max(24px, var(--safe-area-left));
		padding-right: max(24px, var(--safe-area-right));
		height: calc(100% - (var(--navbar-height) + var(--safe-area-top)));
	}
}
</style>
