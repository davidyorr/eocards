<script setup lang="ts">
defineProps<{
	label: string;
	description?: string;
}>();
</script>

<template>
	<label class="option-row">
		<div class="option-text">
			<span class="option-label">{{ label }}</span>
			<span v-if="description" class="option-description">{{
				description
			}}</span>
		</div>
		<!-- The checkbox or switch goes here -->
		<slot />
	</label>
</template>

<style scoped>
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
</style>
