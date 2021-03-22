import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import VueSocketIO from 'vue-socket.io';
import App from './App.vue';
import Home from './Home.vue';
import LobbyMenu from './LobbyMenu.vue';
import Lobby from './Lobby.vue';
import CreateLobby from './CreateLobby.vue';

const app = createApp(App);

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/lobby-menu', name: 'LobbyMenu', component: LobbyMenu },
  { path: '/lobby', name: 'Lobby', component: Lobby },
  { path: '/create-lobby', name: 'CreateLobby', component: CreateLobby }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

app.use(router);

app.use(new VueSocketIO({
  debug: true,
  // @ts-ignore
  connection: `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`
}));

app.mount('#app');
