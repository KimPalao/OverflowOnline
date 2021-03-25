<template>
  <h1>Overflow: Online</h1>
  <form @submit.prevent="handleSubmit">
      <div class = "form-group">
          <label></label>
          <input type = "text" class = "form-control" v-model="username" placeholder="Enter name">
          <button class=" btn">{{"Enter Name"}}</button>

      </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data(){
    return {username: ""}
  },
  name: "Home",
  emits: ["setName"],
  methods:  {
      handleSubmit(){
        if (this.username.length == 0){
          alert("username cannot be blank")
          return
        }
        
        this.$socket.emit('setName', this.username)
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