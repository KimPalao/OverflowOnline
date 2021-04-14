<template>
  <div v-if="error">{{ error }}</div>
  <div v-else-if="loading">Loading</div>
  <div class="wrapper" :style="marginStyle" v-else>
    <router-view />
  </div>
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
      checkingBackend: true,
      loadingAssets: true,
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
    // Alerts with corresponding error if backend is not available
    async checkBackend() {
      try {
        await this.axios.get(this.$socket.io.uri);
        this.checkingBackend = false;
      } catch (error) {
        let errorMessage = "Backend cannot be reached. The game cannot start.";
        if (error?.response?.data?.message)
          errorMessage += this.error = ` Error: ${error.response.data.message}`;
        alert(errorMessage);
      }
    },
    async loadAssets() {
    // Loads assets
    // Alerts with corresponding error if backend is not available
      try {
        const response = await this.axios.get(`${this.$socket.io.uri}/cards`);
        const cards = response.data.data;
        const promises = [];
        for (const card of cards) {
          promises.push(
            new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = function () {
                resolve();
              };
              img.src = `${this.$socket.io.uri}/${card.image}`;
            })
          );
          this.store.state.cardMap[card.id] = card;
        }
        await Promise.all(promises);
        this.loadingAssets = false;
      } catch (error) {
        console.log(error);
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
    // Loads assets
    this.loadAssets();
  },
  computed: {
    marginStyle() {
      if (this.$route.name === "Game") return {};
      return { marginTop: "60px" };
    },
    loading() {
      return this.checkingBackend || this.loadingAssets;
    },
  },
});
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.spacer {
  flex-grow: 1;
}
</style>