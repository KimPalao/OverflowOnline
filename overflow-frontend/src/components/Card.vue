<template>
  <div
    class="card"
    :class="{
      horizontal: horizontal,
      vertical: !horizontal,
      outlined: outlined,
    }"
    :style="style"
  >
    {{ text }}
  </div>
</template>

<script>
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "Card",
  props: {
    horizontal: {
      type: Boolean,
    },
    image: {
      type: String,
    },
    text: {
      type: String,
    },
    outlined: {
      type: Boolean,
    },
    obscured: {
      type: Boolean,
    },
    backVariant: {
      type: Number,
    },
  },
  computed: {
    style() {
      if (this.obscured)
        return {
          backgroundImage: `url("back${this.backVariant}.png")`,
          backgroundSize: "cover",
        };
      return {
        backgroundImage: `url(${this.image})`,
        backgroundSize: "cover",
      };
    },
  },
});
</script>

<style lang="scss" scoped>
$factor: 0.4;
$width: 59mm;
$height: 86mm;

.card {
  background: #000;
  border-radius: 5%;
  line-height: calc(#{$height} * #{$factor});
  text-align: center;
  font-size: 64px;
}

.horizontal {
  min-width: calc(#{$height} * #{$factor});
  max-width: calc(#{$height} * #{$factor});
  min-height: calc(#{$width} * #{$factor});
  max-height: calc(#{$width} * #{$factor});
  margin-bottom: 12px;
}

.vertical {
  display: inline-block;
  min-width: calc(#{$width} * #{$factor});
  max-width: calc(#{$width} * #{$factor});
  min-height: calc(#{$height} * #{$factor});
  max-height: calc(#{$height} * #{$factor});
}

.outlined {
  background: white;
  box-shadow: 0 0 0 1pt black;
}
</style>