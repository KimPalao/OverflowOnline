<template>
  <h1>
    Join an existing lobby <br />
    or create your own
  </h1>
  <div id="buttons">
    <button @click="JoinLobby()" class="button">Join Lobby</button>
    <button @click="CreateLobby()" class="button">Create Lobby</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * This is the LobbyMenu page. This is accessed after Home.
 */
export default defineComponent({
  name: "LobbyMenu",
  methods: {
    // Either join or create a lobby
    CreateLobby() {
      this.$router.push({ name: "CreateLobby" });
    },
    JoinLobby() {
      this.$router.push({ name: "JoinLobby" });
    },
  },
  mounted() {
    console.log("LobbyMenu");
  },
});
</script>

<style scoped>
.button {
  font-size: 32px;
}

#buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
</style>