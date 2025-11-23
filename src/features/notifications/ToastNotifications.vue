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
	bottom: calc(12px + var(--safe-area-bottom));
	width: 100%;

	align-items: center;
	justify-content: center;
	pointer-events: none;

	.notification {
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;

		width: auto;
		max-width: 90%;
		height: 48px;

		padding: 12px 24px;
		border-radius: 8px;
		box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
		color: rgb(255, 255, 255);

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
