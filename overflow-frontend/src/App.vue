<template>
  <div v-if="error">{{ error }}</div>
  <div v-else-if="loading">
    <div id="loader">
      <div id="spinner"></div>
      <img src="overflow.png" alt="Overflow Logo" id="overflow_logo" />
    </div>
  </div>
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
<style lang="scss">
@import "./scss/_variables.scss";
html,
body {
  height: 100%;
}

#app {
  height: 100%;
  font-family: "Roboto Mono", "Courier New", Courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-color;
  background-image: url("bg.png");
  background-size: contain;
  display: flex;
  flex-direction: column;
}

.spacer {
  flex-grow: 1;
}

h1 {
  text-shadow: 1px 1px 2px white;
}

#loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 125px;
  height: 125px;
  display: flex;
  justify-content: center;
  align-items: center;
}

#overflow_logo {
  width: 95px;
  height: 95px;
}

#spinner {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  position: absolute;
  border: 5px solid $text-color;
  border-color: $text-color transparent $text-color;
  border-radius: 50%;
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.input {
  font-family: "Roboto Mono", "Courier New", Courier, monospace;
}

.button {
  border: 2px solid $text-color;
  background: #cddecc;
  font-family: "Roboto Mono", "Courier New", Courier, monospace;
  cursor: pointer;
}
</style>