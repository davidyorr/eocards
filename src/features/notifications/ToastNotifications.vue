<script setup lang="ts">
import { notificationsStore } from "@/stores/notificationsStore";
</script>

<template>
	<div class="notifications">
		<TransitionGroup name="slide-up">
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
		</TransitionGroup>
	</div>
</template>

<style scoped>
.notifications {
	display: flex;
	gap: 12px;
	flex-direction: column;
	position: fixed;
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

	.slide-up-enter-active,
	.slide-up-leave-active {
		transition: all 0.4s ease;
	}
	.slide-up-enter-from,
	.slide-up-leave-to {
		opacity: 0;
		transform: translateY(20px);
	}
}
</style>
