import HomeScreen from "./features/home/HomeScreen.vue";
import LoginScreen from "./features/login/LoginScreen.vue";
import { createRouter, createWebHashHistory } from "vue-router";

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
  ],
});

router.beforeEach((to) => {
  const isAuthenticated = false;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: "/login",
    };
  }
});

export { router };
