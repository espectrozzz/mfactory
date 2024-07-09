import "./assets/main.css";
import "./firebase";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const pinia = createPinia();
const app = createApp(App);
import JsonExcel from "vue-json-excel3";

pinia.use(({ store }) => {
    if(store.$id === 'user') {
        store.getCustomClaim()
    }
})

app.use(pinia);
app.component("downloadExcel", JsonExcel);
app.use(router);

app.mount("#app");
