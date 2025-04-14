<script setup lang="ts">
import { notificationsStore } from "@/stores/notificationsStore";
</script>

<template>
	<div class="notifications">
		<div
			v-for="notification in notificationsStore.notifications"
			:key="notification.id"
			:class="{
				notification: true,
				success: notification.type === 'SUCCESS',
				error: notification.type === 'ERROR',
			}"
		>
			{{ notification.message }}
		</div>
	</div>
</template>

<style scoped>
.notifications {
	display: flex;
	gap: 12px;
	flex-direction: column;
	position: absolute;
	bottom: 0;
	width: 100%;
	align-items: center;
	justify-content: center;

	color: rgb(255, 255, 255);

	.notification {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 100%;
		height: 48px;

		&.success {
			background-color: green;
		}
		&.error {
			background-color: red;
		}
	}
}
</style>
