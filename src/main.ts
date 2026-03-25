import { createApp } from "vue";
import App from "./App.vue";
import "@picocss/pico/css/pico.min.css";
import "./styles.css";
import { router } from "./router";
import BaseModal from "@/shared/BaseModal.vue";
import ModalRow from "@/shared/ModalRow.vue";

const app = createApp(App);

app.component("BaseModal", BaseModal);
app.component("ModalRow", ModalRow);

app.use(router).mount("#app");
