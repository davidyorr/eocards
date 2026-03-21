import { reactive } from "vue";

type State = {
	shuffle: boolean;
};

type Actions = {
	reset: () => void;
};

export const reviewOptionsStore = reactive<State & Actions>({
	shuffle: false,
	reset() {
		this.shuffle = false;
	},
});
