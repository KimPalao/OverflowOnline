import { createApp } from 'vue';
import VueSocketIO from 'vue-socket.io';
import App from './App.vue';

const app = createApp(App);
app.use(new VueSocketIO({
  debug: true,
  // @ts-ignore
  connection: `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`
}));
app.mount('#app');
