<script setup lang="ts">
import { ref } from "vue";
import { reviewOptionsStore } from "@/stores/reviewOptionsStore";

const emit = defineEmits<{ (e: "close"): void }>();
const draftShuffle = ref(reviewOptionsStore.shuffle);

function handleApply() {
	reviewOptionsStore.shuffle = draftShuffle.value;
	emit("close");
}
</script>

<template>
	<BaseModal title="Review options" @close="emit('close')">
		<ModalRow
			label="Shuffle cards"
			description="Randomize card order each session"
		>
			<input type="checkbox" v-model="draftShuffle" role="switch" />
		</ModalRow>

		<template #footer>
			<button class="btn-base btn-cancel" @click="emit('close')">Cancel</button>
			<button class="btn-base btn-apply" @click="handleApply">Apply</button>
		</template>
	</BaseModal>
</template>
