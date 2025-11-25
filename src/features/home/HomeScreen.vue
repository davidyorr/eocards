<script setup lang="ts">
import { Database } from "@/database.types";
import { supabase } from "../../utils/supabase";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
	PlusIcon,
	CheckIcon as ConfirmIcon,
	XIcon as CancelIcon,
	Trash2Icon as DeleteIcon,
} from "lucide-vue-next";
import { notificationsStore } from "@/stores/notificationsStore";

const router = useRouter();

const newDeckName = ref("");
const createNewDeckVisibility = ref(false);
const decks = ref<Array<Database["public"]["Tables"]["deck"]["Row"]>>([]);
const deckToDelete = ref<Database["public"]["Tables"]["deck"]["Row"] | null>(
	null,
);

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

async function handleConfirmDeleteClick() {
	if (deckToDelete.value) {
		try {
			const { error } = await supabase
				.from("deck")
				.delete()
				.eq("id", deckToDelete.value.id);

			if (error) {
				notificationsStore.queueNotification({
					message: "Error deleting deck",
					type: "ERROR",
				});
			} else {
				notificationsStore.queueNotification({
					message: "Deck deleted",
					type: "SUCCESS",
				});
				decks.value = decks.value.filter(
					(deck) => deck.id !== deckToDelete.value?.id,
				);
			}
		} catch (error) {
			console.error("Error deleting deck:", error);
			notificationsStore.queueNotification({
				message: "Error deleting deck",
				type: "ERROR",
			});
		} finally {
			deckToDelete.value = null;
		}
	}
}
</script>

<template>
	<div class="content">
		<dialog :open="deckToDelete !== null">
			<article>
				<header>
					<button aria-label="close" rel="prev" @click="deckToDelete = null">
						<CancelIcon :size="24" />
					</button>
					<p>
						<strong>Delete Deck?</strong>
					</p>
				</header>
				<p>
					Are you sure you want to delete deck
					<strong>{{ deckToDelete?.name }}</strong
					>?
				</p>
				<footer>
					<button class="secondary" @click="deckToDelete = null">
						<CancelIcon :size="24" /> Cancel
					</button>
					<button class="danger" @click="handleConfirmDeleteClick">
						<ConfirmIcon :size="24" /> Confirm
					</button>
				</footer>
			</article>
		</dialog>
		<div class="new-deck-container">
			<button
				v-show="!createNewDeckVisibility"
				class="new-deck-button"
				@click="handleNewDeckClick"
			>
				New Deck <PlusIcon :size="24" />
			</button>
			<div class="confirm-cancel-container">
				<button
					class="secondary"
					v-show="createNewDeckVisibility"
					@click="handleCancelClick"
					alt="cancel"
				>
					<CancelIcon :size="24" />
				</button>
				<button
					v-show="createNewDeckVisibility"
					@click="handleConfirmClick"
					alt="confirm"
				>
					<ConfirmIcon :size="24" />
				</button>
			</div>
			<div v-show="createNewDeckVisibility" class="input-wrapper">
				<input placeholder="name" v-model="newDeckName" />
			</div>
		</div>
		<div class="deck-list">
			<article
				class="deck-row"
				v-for="deck in decks"
				:key="deck.id"
				@click="handleDeckClick(deck.id)"
			>
				<span>{{ deck.name }}</span>
				<button class="delete-deck-button" @click.stop="deckToDelete = deck">
					<DeleteIcon :size="20" />
				</button>
			</article>
		</div>
	</div>
</template>

<style scoped>
.content {
	max-width: 400px;
	margin: 0 auto;
	padding: 12px 0;

	.new-deck-container {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 8px;
		align-items: center;
		margin-bottom: 24px;

		input {
			width: 100%;
			height: 100%;
			margin-left: 8px;
		}
	}

	.new-deck-button {
		padding: 0.75rem 1.5rem;
		width: 100%;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: 4px;
	}

	.confirm-cancel-container {
		display: flex;
		gap: 8px;

		button {
			width: 2.75rem;
			height: 2.75rem;
			padding: 0;
			margin: 0;
		}
	}

	.input-wrapper {
		width: 100%;
		height: 100%;

		input {
			width: 100%;
			height: 100%;
			margin: 0;
		}
	}

	.deck-list {
		display: grid;

		.deck-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1rem 1.25rem;
			cursor: pointer;
			transition:
				transform 0.2s ease-in-out,
				box-shadow 0.2s ease-in-out;

			&:hover {
				transform: translateY(-2px);
				box-shadow: var(--pico-card-box-shadow);
			}

			.delete-deck-button {
				background: transparent;
				border: none;
				padding: 8px;
				margin: -8px;
				color: var(--pico-muted-color);
				display: flex;
				align-items: center;
				justify-content: center;
				transition: color 0.2s;
				width: auto;

				&:hover,
				&:focus {
					color: var(--error-message-color);
					transform: scale(1.1);
				}
			}
		}
	}

	button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		color: white;
		padding: 8px 16px;
		gap: 4px;
		cursor: pointer;
	}

	.danger {
		background-color: var(--error-message-color);
		border-color: var(--error-message-color);
	}
}
</style>
