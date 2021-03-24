<template>
  <h1>Overflow: Online</h1>
  <form @submit.prevent="handleSubmit">
      <div class = "form-group">
          <label></label>
          <input type = "text" class = "form-control" v-model="username" placeholder="Enter name">
      </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Home",
  methods:  {
      handleSubmit(){
        console.log(this.username);
      }
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>