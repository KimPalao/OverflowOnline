<template>
  <h1>Lobby</h1>

  <!-- UC1-S8: Host kicks player from lobby -->
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label></label>
      <input
        type="text"
        class="form-control"
        v-model="kickedPlayer"
        placeholder="Kick which Player?"
      />
      <button class="btn">{{ "Create" }}</button>
    </div>
  </form>
  <!-- /UC1-S8 -->

  <!-- UC1-S9: Host starts game successfully -->
  <button @click="onClick()"> {{ "Start Game" }} </button>
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
      // This is the name of the player that is being kicked
      kickedPlayer: "",
    };
  },
  name: "Lobby",
  sockets: {
    gameStartEvent(){
      // Navigates to game page
    },
    kickEvent() {
      this.store.state.lobbyCode = "";
      // navigate to LobbyMenu
    }
  },
  methods: {
    handleSubmit(){
      if (this.kickedPlayer.trim().length == 0){
        alert("Please enter a Username");
        return;
      }
      this.$socket.emit('kickPlayer', this.kickedPlayer);
    },
    onClick(){
      this.$socket.emit('startGame');
    },
  },

  mounted() {
    console.log("Lobby");
  },
});
</script>

<style>
</style>
