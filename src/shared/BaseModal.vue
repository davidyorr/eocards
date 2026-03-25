<script setup lang="ts">
defineProps<{ title: string }>();
const emit = defineEmits<{ (e: "close"): void }>();
</script>

<template>
	<div class="modal-backdrop" @click.self="emit('close')">
		<div class="modal">
			<div class="modal-header">
				<span>{{ title }}</span>
				<button class="close-btn" @click="emit('close')">✕</button>
			</div>

			<div class="modal-body">
				<slot />
			</div>

			<div class="modal-footer">
				<slot name="footer" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.modal-backdrop {
	position: fixed;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 200;
}

.modal {
	background-color: rgb(52, 58, 64);
	border-radius: 12px;
	width: min(400px, 90vw);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	font-size: 0.95rem;
	font-weight: 600;
	letter-spacing: 0.02em;

	.close-btn {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.85rem;
		cursor: pointer;
		padding: 2px 6px;
		line-height: 1;

		&:hover {
			color: rgba(255, 255, 255, 0.9);
		}
	}
}

.modal-body {
	display: flex;
	flex-direction: column;
	padding: 8px 0;
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	padding: 12px 20px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);

	button {
		border: none;
		border-radius: 6px;
		padding: 8px 18px;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.btn-cancel {
		background-color: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.75);

		&:hover {
			background-color: rgba(255, 255, 255, 0.13);
		}
	}

	.btn-apply {
		background-color: var(--primary);
		color: rgb(40, 40, 40);

		&:hover {
			filter: brightness(1.1);
		}
	}
}

:deep(button.btn-base) {
	border: none;
	border-radius: 6px;
	padding: 8px 18px;
	font-size: 0.875rem;
	cursor: pointer;
}
:deep(.btn-cancel) {
	background: rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.75);
}
:deep(.btn-apply) {
	background-color: var(--primary);
	color: rgb(40, 40, 40);
}
</style>
