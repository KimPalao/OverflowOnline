<template>
  <h1>Enter an existing lobby code</h1>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label></label>
      <input
        type="text"
        class="input"
        v-model="lobbyCode"
        placeholder="Enter code"
      />
      <button class="button">Join</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
/**
 * This is the JoinLobby page. Here, the user will be able to join a lobby.
 */
export default defineComponent({
  data() {
    return {
      /**
       * This is the code of the lobby
       * that the user will try to join
       *
       * @type string
       */
      lobbyCode: "",
    };
  },
  name: "JoinLobby",
  sockets: {
    /**
     * Handles Socket.IO server's response to the joinLobby event emitted
     *
     * @param {Object} payload - The response from the server
     * @param {boolean} payload.result - True if the lobby code is valid, false otherwise.
     * @param {string} payload.message - Set to the lobby code if result=true, otherwise it is set to the error message.
     */
    joinLobbyResponse({
      result,
      message,
    }: {
      result: boolean;
      message: string;
    }) {
      if (result) {
        this.store.state.lobbyCode = message;
        this.$router.push({ name: "Lobby" });
      } else {
        this.$emit("dialog", message);
      }
    },
  },
  methods: {
    // Players get an error alert if the lobby code entered is blank
    handleSubmit() {
      if (this.lobbyCode.trim().length == 0) {
        this.$emit("dialog", "Code cannot be blank");
        return;
      }
      this.$socket.emit("joinLobby", this.lobbyCode);
    },
  },
  mounted() {
    console.log("JoinLobby");
  },
});
</script>

<style scoped>
.input,
.button {
  font-size: 24px;
}
</style>