<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "../../utils/supabase";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PlusIcon from "~icons/qlementine-icons/plus-12";
import ConfirmIcon from "~icons/qlementine-icons/check-tick-16";
import CancelIcon from "~icons/qlementine-icons/close-12";

const router = useRouter();

const newDeckName = ref("");
const createNewDeckVisibility = ref(false);
const decks = ref<Array<Database["public"]["Tables"]["deck"]["Row"]>>([]);

onMounted(() => {
	fetchDecks();
});

async function fetchDecks() {
	console.log("fetching decks");
	try {
		const { data, error } = await supabase.from("deck").select();

		if (error) {
			console.error("Error fetching decks:", error);
			return;
		}
		console.log("fetched decks", data);

		decks.value = data;
	} catch (error) {
		console.error("Error fetching decks:", error);
	}
}

function handleNewDeckClick() {
	createNewDeckVisibility.value = true;
}

async function handleCancelClick() {
	createNewDeckVisibility.value = false;
}

async function handleConfirmClick() {
	if (newDeckName.value === "") {
		return;
	}
	const userId = (await supabase.auth.getUser()).data.user?.id;
	if (userId) {
		const response = await supabase
			.from("deck")
			.insert({
				name: newDeckName.value,
				user_id: userId,
			})
			.select();
		// response.status === 201
		console.log(response);

		createNewDeckVisibility.value = false;
		fetchDecks();
		router.push(`/deck/edit/${response.data?.[0].id}`);
	}
}

async function handleDeckClick(deckId: number) {
	router.push(`/deck/review/${deckId}`);
}
</script>

<template>
	<div class="content">
		<div class="new-deck-container">
			<button
				v-show="!createNewDeckVisibility"
				class="new-deck-button"
				@click="handleNewDeckClick"
			>
				New Deck <PlusIcon />
			</button>
			<div class="confirm-cancel-container">
				<button
					class="cancel"
					v-show="createNewDeckVisibility"
					@click="handleCancelClick"
					alt="cancel"
				>
					<CancelIcon />
				</button>
				<button
					v-show="createNewDeckVisibility"
					@click="handleConfirmClick"
					alt="confirm"
				>
					<ConfirmIcon />
				</button>
			</div>
			<div v-show="createNewDeckVisibility">
				<input placeholder="name" v-model="newDeckName" />
			</div>
		</div>
		<div class="deck-list">
			<div
				class="deck-row"
				v-for="deck in decks"
				:key="deck.id"
				@click="handleDeckClick(deck.id)"
			>
				{{ deck.name }}
			</div>
		</div>
	</div>
</template>

<style scoped>
.content {
	max-width: 400px;
	margin: 0 auto;
	padding: 12px 0;
	text-align: justify;

	.new-deck-container {
		display: grid;
		grid-template-columns: 138px auto;
		height: 36px;

		.cancel {
			background-color: rgb(118, 118, 136);
		}

		input {
			width: 100%;
			height: 100%;
			margin-left: 8px;
		}
	}

	.confirm-cancel-container {
		display: flex;
		margin: 0 auto;
		gap: 8px;

		button {
			border-radius: 12px;
		}
	}

	.deck-list {
		padding: 8px 0;

		.deck-row {
			padding: 2px 0;
			cursor: pointer;
		}
	}

	button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		background-color: rgb(43, 86, 175);
		color: white;
		padding: 8px 16px;
		gap: 4px;
		cursor: pointer;
	}

	.new-deck-button {
		padding-left: 24px;
	}
}
</style>
