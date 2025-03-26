import { supabase } from "@/utils/supabase";
import { ref, watchEffect } from "vue";

export function useCards(deckId: number) {
	const cards = ref<Awaited<ReturnType<typeof fetchCards>>>([]);
	const loading = ref(false);

	async function fetchCards() {
		console.log("fetching cards");
		if (Number.isNaN(deckId)) {
			return [];
		}
		try {
			loading.value = true;
			const { data, error } = await supabase
				.from("card")
				.select(
					`
						*,
						card_attribute_value (
							*,
							deck_attribute_type (
								attribute_name
							)
						)
					`,
				)
				.eq("deck_id", deckId)
				.order("display_order");
			loading.value = false;

			if (error) {
				console.error("Error fetching cards:", error);
				return [];
			}
			console.log("fetched cards", data);
			return data;
		} catch (error) {
			console.error("Error fetching cards:", error);
			loading.value = false;
			return [];
		}
	}

	watchEffect(async () => {
		cards.value = await fetchCards();
	});

	return {
		cards,
		loading,
	};
}
