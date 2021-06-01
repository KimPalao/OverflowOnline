<template>
  <h1>Overflow: Online</h1>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label></label>
      <input
        type="text"
        class="input"
        v-model="username"
        placeholder="Display Name"
      />
      <button class="button">Enter</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * This is the home page. Here, the user will be able to set their username.
 */
export default defineComponent({
  data() {
    return {
      /**
       * This is the username the user will set
       * @type string
       */
      username: "",
    };
  },
  name: "Home",
  sockets: {
    /**
     * Handles Socket.IO server's response to the setName event emitted
     *
     * @param {Object} payload - The response from the server
     * @param {boolean} payload.result - True if the name was set correctly, false otherwise.
     * @param {string} payload.message - Set to the username if result=true, otherwise it is set to the error message.
     */
    setNameResponse({ result, message }: { result: boolean; message: any }) {
      if (result) {
        this.store.state.displayName = message;
        this.$router.push({ name: "LobbyMenu" });
      } else {
        this.$emit("dialog", message);
      }
    },
  },
  methods: {
    /**
     * Event handler for the form
     */
    handleSubmit() {
      if (this.username.trim().length == 0) {
        this.$emit("dialog", "Username cannot be blank");
        return;
      }
      this.$socket.emit("setName", this.username);
    },
  },
});
</script>

<style scoped>
.input,
.button {
  font-size: 24px;
}
</style>