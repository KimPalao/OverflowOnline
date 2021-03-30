<template>
  <div v-if="error">{{ error }}</div>
  <div v-else-if="loading">Loading</div>
  <router-view v-else />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

/**
 * This is the root of the App
 */
export default defineComponent({
  name: "App",
  data() {
    return {
      loading: true,
      error: "",
    };
  },
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
  methods: {
    async checkBackend() {
      try {
        await this.axios.get(this.$socket.io.uri);
        this.loading = false;
      } catch (error) {
        let errorMessage = "Backend cannot be reached. The game cannot start.";
        if (error?.response?.data?.message)
          errorMessage += this.error = ` Error: ${error.response.data.message}`;
        alert(errorMessage);
      }
    },
  },
  mounted() {
    // Check for backend availability
    this.checkBackend();

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