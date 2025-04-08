import { User } from "@supabase/supabase-js";
import { reactive } from "vue";

type State = {
	user: User | null;
	reset: () => void;
};

export const userStore = reactive<State>({
	user: null,
	reset() {
		this.user = null;
	},
});
