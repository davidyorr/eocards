<script setup lang="ts">
import { ref } from "vue";
import { reviewOptionsStore } from "@/stores/reviewOptionsStore";

const emit = defineEmits<{ (e: "close"): void }>();

const draftShuffle = ref(reviewOptionsStore.shuffle);

function handleApply() {
	reviewOptionsStore.shuffle = draftShuffle.value;
	emit("close");
}

function handleCancel() {
	emit("close");
}
</script>

<template>
	<div class="modal-backdrop" @click.self="handleCancel">
		<div class="modal">
			<div class="modal-header">
				<span>Review options</span>
				<button class="close-btn" @click="handleCancel">✕</button>
			</div>

			<div class="modal-body">
				<label class="option-row">
					<div class="option-text">
						<span class="option-label">Shuffle cards</span>
						<span class="option-description"
							>Randomize card order each session</span
						>
					</div>
					<input type="checkbox" v-model="draftShuffle" role="switch" />
				</label>
			</div>

			<div class="modal-footer">
				<button class="btn-cancel" @click="handleCancel">Cancel</button>
				<button class="btn-apply" @click="handleApply">Apply</button>
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

.option-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 14px 20px;
	cursor: pointer;
	gap: 24px;

	&:not(:last-child) {
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
	}

	&:hover {
		background-color: rgba(255, 255, 255, 0.04);
	}

	.option-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.option-label {
		font-size: 0.9rem;
	}

	.option-description {
		font-size: 0.75rem;
		opacity: 0.45;
	}
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
</style>
