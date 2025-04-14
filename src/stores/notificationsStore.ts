import { reactive } from "vue";

const DISMISS_TIMEOUT = 5000;
let id = 0;

type Notification = {
	id: number;
	message: string;
	type: "ERROR" | "SUCCESS";
};

type State = {
	notifications: Array<Notification>;
};

type Actions = {
	queueNotification: (
		notification: Pick<Notification, "message" | "type">,
	) => void;
};

export const notificationsStore = reactive<State & Actions>({
	notifications: [],
	queueNotification(notification) {
		this.notifications.push({ id: id++, ...notification });
		setTimeout(() => {
			this.notifications.shift();
		}, DISMISS_TIMEOUT);
	},
});
