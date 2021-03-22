<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  sockets: {
    connect: function () {
      console.log("socket connected");
    },
  },
});
</script>