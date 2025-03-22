import HomeScreen from "./features/home/HomeScreen.vue";
import LoginScreen from "./features/login/LoginScreen.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { supabase } from "./utils/supabase";
import DeckViewerScreen from "./features/deck-viewer/DeckViewerScreen.vue";

const router = createRouter({
  history: createWebHashHistory(),
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
      path: "/deck/:id",
      name: "Deck",
      component: DeckViewerScreen,
    },
  ],
});

router.beforeEach(async (to) => {
  const user = await supabase.auth.getUser();
  console.log("user", user);
  const isAuthenticated = user.data.user !== null;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: "/login",
    };
  }
});

export { router };
