import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";

// we need to handle both node and vite (playwright testing vs running the app)
const env = typeof process !== "undefined" ? process.env : import.meta.env;

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_KEY;

export const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

export function getSupabaseAdmin() {
	return createClient<Database>(
		env.VITE_SUPABASE_URL!,
		env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
	);
}
