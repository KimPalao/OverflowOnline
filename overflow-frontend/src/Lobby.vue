<template>
  <h1>Lobby</h1>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * This is the Lobby page. This is accessed after JoinLobby or CreateLobby.
 */
export default defineComponent({
  name: "Lobby",
  mounted() {
    console.log("Lobby");
  },
});
</script>

<style>
</style>