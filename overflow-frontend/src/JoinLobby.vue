<template>
  <h1>JoinLobby</h1>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label></label>
      <input
        type="text"
        class="form-control"
        v-model="lobbyCode"
        placeholder="Enter code"
      />
      <button class="btn">{{ "Join" }}</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return { lobbyCode: "" };
  },
  name: "JoinLobby",
  sockets: {
    JoinLobbyResponse({result, message}: {result: boolean, message: string}) {  
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
      if (this.username.trim().length == 0) {
        alert("Code cannot be blank");
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

<style>
</style>