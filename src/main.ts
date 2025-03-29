import { createApp } from "vue";
import App from "./App.vue";
import "./reset.css";
import "./styles.css";
import { router } from "./router";

createApp(App).use(router).mount("#app");
