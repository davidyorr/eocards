import { User } from "@supabase/supabase-js";
import { reactive } from "vue";

type State = {
	user: User | null;
};

type Actions = {
	reset: () => void;
};

export const userStore = reactive<State & Actions>({
	user: null,
	reset() {
		this.user = null;
	},
});
