import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import VueSocketIO from 'vue-socket.io';
import axios from 'axios';
import VueAxios from 'vue-axios';
import App from './App.vue';
import store from './store';
import Home from './pages/Home.vue';
import LobbyMenu from './pages/LobbyMenu.vue';
import Lobby from './pages/Lobby.vue';
import CreateLobby from './pages/CreateLobby.vue';
import JoinLobby from './pages/JoinLobby.vue';

// Create a Vue instance using the App as the root component
const app = createApp(App);

// Allow the store to be accessible globally
app.config.globalProperties.store = store;

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/lobby-menu', name: 'LobbyMenu', component: LobbyMenu },
  { path: '/lobby', name: 'Lobby', component: Lobby },
  { path: '/create-lobby', name: 'CreateLobby', component: CreateLobby },
  { path: '/join-lobby', name: 'JoinLobby', component: JoinLobby }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

app.use(router);

app.use(new VueSocketIO({
  debug: true,
  connection: `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`
}));

app.use(VueAxios, axios);

app.mount('#app');
