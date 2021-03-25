<template>
  <h1>CreateLobby</h1>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label></label>
      <input
        type="text"
        class="form-control"
        v-model="lobbyCode"
        placeholder="Enter code"
      />
      <button class="btn">{{ "Create" }}</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * This is the page where the User creates a Lobby.
 * Accessed when the user selects "Create Lobby" from the LobbyMenu
 */
export default defineComponent({
  data() {
    return { lobbyCode: "" };
  },
  name: "CreateLobby",
  sockets: {
    createLobbyResponse({
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
        alert(message);
      }
    },
  },
  methods: {
    handleSubmit() {
      if (this.lobbyCode.trim().length == 0) {
        alert("Code cannot be blank");
        return;
      }
      this.$socket.emit("createLobby", this.lobbyCode);
    },
  },
  mounted() {
    console.log("CreateLobby");
  },
});
</script>

<style>
</style>