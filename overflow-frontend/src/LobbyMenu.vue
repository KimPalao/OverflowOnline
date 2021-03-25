<template>
  <h1>LobbyMenu</h1>
  <button @click="JoinLobby()" class="btn">{{ "Join Lobby" }}</button>
  <button @click="CreateLobby()" class ="btn">{{ "Create Lobby" }}</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * This is the LobbyMenu page. This is accessed after Home.
 */
export default defineComponent({
  name: "LobbyMenu",
  methods: {
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

<style>
</style>