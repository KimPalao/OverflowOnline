import { createApp } from 'vue';
import VueSocketIO from 'vue-socket.io';
import App from './App.vue';
// @ts-ignore
import SocketIO from 'socket.io-client';

const app = createApp(App);
app.use(new VueSocketIO({
  debug: true,
  // @ts-ignore
  connection: SocketIO(`http://localhost:3001`), //options object is Optional
}));
app.mount('#app');
