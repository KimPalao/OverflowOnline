import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import LobbyMenu from './pages/LobbyMenu.vue';
import Lobby from './pages/Lobby.vue';
import CreateLobby from './pages/CreateLobby.vue';
import JoinLobby from './pages/JoinLobby.vue';
import Game from './pages/Game.vue';
import store from './store';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/lobby-menu', name: 'LobbyMenu', component: LobbyMenu },
  { path: '/lobby', name: 'Lobby', component: Lobby },
  { path: '/create-lobby', name: 'CreateLobby', component: CreateLobby },
  { path: '/join-lobby', name: 'JoinLobby', component: JoinLobby },
  { path: '/game', name: 'Game', component: Game }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from) => {
  if (to.name === "Game") {
    // For now, allow the game to be acessed directly
    return true;
  } 
  if (
    store.state.displayName.length === 0 &&
    to.name !== "Home"
  ) {
    // Check if the user skipped setting a username
    return { name: "Home" };
  } 
  if (
    // Chcek if the user skipped picking a lobby
    store.state.lobbyCode.length === 0 &&
    !["LobbyMenu", "CreateLobby", "JoinLobby", "Home"].includes(to.name?.toString() ||"")
  ) {
    return { name: "LobbyMenu" };
  }
  return true;
});

export default router;
