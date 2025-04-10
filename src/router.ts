import HomeScreen from "./features/home/HomeScreen.vue";
import LoginScreen from "./features/login/LoginScreen.vue";
import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "./utils/supabase";
import DeckReviewer from "./features/deck/DeckReviewer.vue";
import DeckEditor from "./features/deck/DeckEditor.vue";
import { userStore } from "./stores/userStore";

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			name: "Home",
			component: HomeScreen,
			meta: {
				requiresAuth: true,
			},
		},
		{
			path: "/login",
			name: "Login",
			component: LoginScreen,
		},
		{
			path: "/deck/review/:id",
			name: "Deck Reviewer",
			component: DeckReviewer,
			meta: {
				requiresAuth: true,
			},
		},
		{
			path: "/deck/edit/:id",
			name: "Deck Editor",
			component: DeckEditor,
			meta: {
				requiresAuth: true,
			},
		},
	],
});

router.beforeEach(async (to) => {
	const user = await supabase.auth.getUser();
	console.log("user", user);
	const isAuthenticated = user.data.user !== null;
	userStore.user = user.data.user;

	if (to.meta.requiresAuth && !isAuthenticated) {
		return {
			path: "/login",
		};
	}
});

export { router };
