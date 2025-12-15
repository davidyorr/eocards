import { reactive } from "vue";

const DEFAULT_DISMISS_TIMEOUT = 5000;

function getDismissTimeout() {
	const raw = import.meta.env.VITE_NOTIFICATION_DISMISS_TIMEOUT;

	if (!raw) return DEFAULT_DISMISS_TIMEOUT;

	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : DEFAULT_DISMISS_TIMEOUT;
}

const DISMISS_TIMEOUT = getDismissTimeout();
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
