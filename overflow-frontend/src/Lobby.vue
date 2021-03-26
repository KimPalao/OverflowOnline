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
        v-if="isHost"
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
      players: [],
    };
  },
  name: "Lobby",
  sockets: {
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
    getPlayersResponse({ players }: { players: Array<any> }) {
      this.players = players;
    },
    gameStartEvent() {
      // Navigates to game page
    },
    startGameResponse({ result, message }: { result: boolean; message: any }) {
      if (!result) {
        alert(message);
      }
    },
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
      if (this.players.length < 1) return false;
      console.log(this.$socket.id, this.players[0].playerId);
      return this.$socket.id === this.players[0].playerId;
    },
  },
  methods: {
    handleSubmit() {
      if (this.kickedPlayer.trim().length == 0) {
        alert("Please enter a Username");
        return;
      }
      this.$socket.emit("kickPlayer", this.kickedPlayer);
    },
    onClick() {
      if (this.players.length < 2) {
        return alert("Cannot start game with only player");
      }
      this.$socket.emit("startGame");
    },
    kickPlayer(playerId) {
      this.$socket.emit("kickPlayer", {
        lobbyCode: this.store.state.lobbyCode,
        playerId,
      });
    },
  },
  mounted() {
    console.log("Lobby");
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
