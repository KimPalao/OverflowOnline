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
    debug({ message, ...rest }: { message: any; rest: Array<any> }) {
      console.log(`Server sent the message:`, message);
      console.log(`Server also sent the following`);
      console.log(rest);
    },
  },
});
</script>