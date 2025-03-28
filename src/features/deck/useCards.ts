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
			const { data: attributeTypes, error: attributeTypesError } =
				await supabase
					.from("deck_attribute_type")
					.select()
					.eq("deck_id", deckId);

			if (attributeTypesError) {
				console.error("Error fetching attribute types:", attributeTypesError);
				return [];
			}

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

			const populatedCards = data.map((card) => {
				const existingAttributeValues = new Map(
					card.card_attribute_value.map((attr) => [
						attr.deck_attribute_type.attribute_name,
						attr,
					]),
				);
				console.log("existing", existingAttributeValues);

				const fullAttributeValues = attributeTypes.map((attrType) => {
					// If an attribute value exists, use it
					if (existingAttributeValues.has(attrType.attribute_name)) {
						const existingAttributeValue = existingAttributeValues.get(
							attrType.attribute_name,
						);
						if (existingAttributeValue) {
							return existingAttributeValue;
						}
					}
					const id = -performance.now();

					// Otherwise, create a blank attribute value
					const blankAttribute: (typeof card.card_attribute_value)[number] = {
						id: id,
						card_id: card.id,
						value: "",
						created_at: "",
						deck_attribute_type_id: attrType.id,
						deck_attribute_type: {
							attribute_name: attrType.attribute_name,
						},
					};

					return blankAttribute;
				});

				return {
					...card,
					card_attribute_value: fullAttributeValues,
				};
			});

			console.log("with attribute values", populatedCards);

			return populatedCards;
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
