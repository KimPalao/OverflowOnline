<template>
  <h1>Lobby</h1>

  <div class="lobby-box">
    <h2>Room Code: {{ store.state.lobbyCode }}</h2>

    <div
      v-for="(player, index) in players"
      :key="player.playerId"
      class="player-name-container"
    >
      <h3>{{ index + 1 }}. {{ player.displayName }}</h3>
      <span
        v-if="isHost && index !== 0"
        class="kick-button"
        style="cursor: pointer"
        @click="kickPlayer(player.playerId)"
        >&times;</span
      >
    </div>
  </div>

  <br />

  <!-- UC1-S9: Host starts game successfully -->
  <button @click="onClick()" v-if="isHost">{{ "Start Game" }}</button>
  <!-- /UC1-S9 -->
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * This is the Lobby page. This is accessed after JoinLobby or CreateLobby.
 */
export default defineComponent({
  data() {
    return {
      /**
       * The list of players assigned to the current lobby
       * @type Array
       */
      players: [],
    };
  },
  name: "Lobby",
  sockets: {
    /**
     * Listens to the event where a player joins the current lobby
     *
     * @param {Object} payload The response from the server
     * @param {string} payload.displayName The display name of the new player
     * @param {string} payload.playerId The Socket.IO id of the new player
     */
    playerJoin({
      displayName,
      playerId,
    }: {
      displayName: string;
      playerId: string;
    }) {
      this.players.push({
        displayName,
        playerId,
      });
    },
    /**
     * Handles Socket.IO server's resposne to the getPlayers event emitted
     *
     * @param {Object} payload The response from the server
     * @param {string} payload.players The list of players
     */
    getPlayersResponse({ players }: { players: Array<any> }) {
      this.players = players;
    },
    /**
     * Listens to the event where the host successfully starts the game
     */
    gameStartEvent() {
      console.log("Game has been started");
      alert("Game to be implemented");
      // TODO: Uncomment once the Game page has been created
      // this.$router.push({ name: "Game" });
    },
    /**
     * Handles Socket.IO server's resposne to the startGame event emitted
     *
     * @param {Object} payload The response from the server
     * @param {boolean} payload.result - False if the game was not started successfully.
     * @param {string} payload.message - The error message from failing to start the game
     */
    startGameResponse({ result, message }: { result: boolean; message: any }) {
      if (!result) {
        alert(message);
      }
    },
    /**
     * Listens to the event where a player is kicked from the lobby
     */
    kickEvent({ playerId }: { playerId: string }) {
      if (playerId === this.$socket.id) {
        // When the user is kicked
        this.store.state.lobbyCode = "";
        // navigate to LobbyMenu
        this.$router.push({ name: "LobbyMenu" });
      } else {
        // When one of the other players is kicked
        this.players = this.players.filter(
          (player) => player.playerId !== playerId
        );
      }
    },
  },
  computed: {
    isHost() {
      // Checks if the list of players has been populated
      if (this.players.length < 1) return false;
      return this.$socket.id === this.players[0].playerId;
    },
  },
  methods: {
    /**
     * Event handler for the "Start Game" button
     */
    onClick() {
      if (this.players.length < 2) {
        return alert("Cannot start game with only one player");
      }
      this.$socket.emit("startGame", this.store.state.lobbyCode);
    },
    /**
     * Sends a message to the Socket.IO server to kick a player
     */
    kickPlayer(playerId) {
      this.$socket.emit("kickPlayer", {
        lobbyCode: this.store.state.lobbyCode,
        playerId,
      });
    },
  },
  mounted() {
    console.log("Lobby");
    // On mount, get the list of players currently in the lobby
    this.$socket.emit("getPlayers", this.store.state.lobbyCode);
  },
});
</script>

<style>
.lobby-box {
  border: 1px solid black;
  border-radius: 10px;
  width: 50%;
  margin: auto;
}
h3 {
  text-align: left;
  text-indent: 2rem;
  display: inline-block;
}

.player-name-container {
  display: flex;
  justify-content: space-between;
}

.kick-button {
  font-size: 20px;
  font-weight: bold;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-right: 1em;
}
</style>
