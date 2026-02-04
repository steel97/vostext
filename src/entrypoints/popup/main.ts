import "@/assets/main.css";
import { createApp } from "vue";
import App from "@/entrypoints/popup/App.vue";
import ui from "@nuxt/ui/vue-plugin";

const app = createApp(App);
app.use(ui);

app.mount("#app");
