import { getSupabaseAdmin } from "@/utils/supabase";
import { test as teardown } from "@playwright/test";

teardown("clean up database", async ({}) => {
	const supabaseAdmin = getSupabaseAdmin();
	try {
		// the data must be deleted in a certain order to avoid "foreign key constraint" errors

		// delete deck attribute types
		await supabaseAdmin.from("deck_attribute_type").delete().neq("id", -1);

		// delete card attribute values
		await supabaseAdmin.from("card_attribute_value").delete().neq("id", -1);

		// delete cards
		await supabaseAdmin.from("card").delete().neq("id", -1);

		// delete decks
		await supabaseAdmin.from("deck").delete().neq("id", -1);
	} catch (error) {
		console.error(`Failed to delete decks:`, error);
	}
});
