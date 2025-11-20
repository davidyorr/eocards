import { getSupabaseAdmin } from "@/utils/supabase";
import { test as teardown } from "@playwright/test";

teardown("clean up database", async () => {
	const supabaseAdmin = getSupabaseAdmin();
	try {
		// delete decks
		await supabaseAdmin.from("deck").delete().neq("id", -1);

		// delete user preferences
		await supabaseAdmin.from("user").delete().neq("id", -1);
	} catch (error) {
		console.error(`Failed to delete decks:`, error);
	}
});
