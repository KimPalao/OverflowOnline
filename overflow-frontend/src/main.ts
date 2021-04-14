import { createApp } from 'vue';
import VueSocketIO from 'vue-socket.io';
import axios from 'axios';
import VueAxios from 'vue-axios';
import App from './App.vue';
import store from './store';
import router from './router';

// Create a Vue instance using the App as the root component
const app = createApp(App);

// Allow the store to be accessible globally
app.config.globalProperties.store = store;

app.use(router);

app.use(new VueSocketIO({
  debug: true,
  connection: `${import.meta.env.VITE_HOST}:${import.meta.env.VITE_BACKEND_PORT}`
}));

app.use(VueAxios, axios);

app.mount('#app');
