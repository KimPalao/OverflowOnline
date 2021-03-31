import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import LobbyMenu from './pages/LobbyMenu.vue';
import Lobby from './pages/Lobby.vue';
import CreateLobby from './pages/CreateLobby.vue';
import JoinLobby from './pages/JoinLobby.vue';

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/lobby-menu', name: 'LobbyMenu', component: LobbyMenu },
  { path: '/lobby', name: 'Lobby', component: Lobby },
  { path: '/create-lobby', name: 'CreateLobby', component: CreateLobby },
  { path: '/join-lobby', name: 'JoinLobby', component: JoinLobby },
]

export default createRouter({
  history: createWebHistory(),
  routes
});
