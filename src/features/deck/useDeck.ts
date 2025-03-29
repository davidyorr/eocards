import { supabase } from "@/utils/supabase";
import { ref, watchEffect } from "vue";

export function useDeck(deckId: number) {
	const deck = ref<Awaited<ReturnType<typeof fetchDeck>>>();
	const loading = ref(false);

	async function fetchDeck() {
		console.log("fetching decks");
		try {
			loading.value = true;
			const { data, error } = await supabase
				.from("deck")
				.select()
				.eq("id", deckId)
				.single();
			loading.value = false;

			if (error) {
				console.error("Error fetching deck:", error);
			}
			console.log("fetched deck", data);

			return data;
		} catch (error) {
			console.error("Error fetching deck:", error);
		}
	}

	watchEffect(async () => {
		deck.value = await fetchDeck();
	});

	return {
		deck,
		loading,
	};
}
