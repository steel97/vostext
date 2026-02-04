import "@/assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import ui from "@nuxt/ui/vue-plugin";

export default defineContentScript({
  matches: ["*://*.vost.pw/*", "*://*.animevost.org/*", "*://animevost.org/*", "*://vost.pw/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const root = await createShadowRootUi(ctx, {
      name: "vostext-ui",
      position: "inline",
      anchor: ".functionPanel",
      append: "after",
      onMount: (container, shadow) => {
        const teleportTarget = shadow.querySelector("body")!;
        const div = document.createElement("div");
        div.id = "app";
        div.className = "isolate";
        container.appendChild(div);
        const app = createApp(App);
        app.provide("TeleportTarget", teleportTarget);
        app.provide("PageContext", ctx);
        app.use(ui);
        app.mount(div);
        return app;
      },
      onRemove: (app) => {
        app?.unmount();
      },
    });

    root.mount();
  },
});
