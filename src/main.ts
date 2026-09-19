import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router/index.ts";
import { createPinia } from "pinia";
import "@fontsource-variable/inter";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useAuthStore } from "./features/auth/stores/useAuthStore.ts";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

async function bootstrap() {
    const app = createApp(App);
    app.use(pinia);

    const authStore = useAuthStore(pinia);
    await authStore.init();

    app.use(router);
    app.mount("#app");
}

bootstrap();
