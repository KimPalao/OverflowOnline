<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

/**
 * This is the root of the App
 */
export default defineComponent({
  name: "App",
  sockets: {
    /**
     * Runs when the socket connects
     *
     * @returns void
     */
    connect(): void {
      console.log("socket connected");
    },
    /**
     * Prints debug messages from the server
     *
     * @param {Object} payload - The response from the server
     * @param {any} payload.message - The main message from the server
     * @param {any} payload.rest - Other messages present in the response
     */
    debug({ message, ...rest }: { message: any; rest: Array<any> }): void {
      console.log(`Server sent the message:`, message);
      console.log(`Server also sent the following`);
      console.log(rest);
    },
  },
  mounted() {
    const route = useRoute();
    // Do not allow user to go to pages directly

    if (this.store.state.displayName.length === 0 && route.name !== "Home") {
      // Check if the user skipped setting a username
      this.$router.push({ name: "home" });
    } else if (
      // Chcek if the user skipped picking a lobby
      this.store.state.lobbyCode.length === 0 &&
      !["LobbyMenu", "CreateLobby", "JoinLobby"].includes(route.name.toString())
    ) {
      this.$router.push({ name: "LobbyMenu" });
    }
  },
});
</script>