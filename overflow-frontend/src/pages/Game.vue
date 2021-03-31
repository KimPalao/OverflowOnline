<template>
  <div class="grid">
    <div id="top-cards">
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div>
        <p>Player 4</p>
        <p>Points: 010</p>
      </div>
    </div>
    <div id="left-cards">
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div>
        <p>Player 2</p>
        <p>Points: 010</p>
      </div>
    </div>
    <div id="right-cards">
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div class="card"></div>
      <div>
        <p>Player 3</p>
        <p>Points: 010</p>
      </div>
    </div>
    <div id="bottom-cards">
      <div class="card">01</div>
      <div class="card">10</div>
      <div class="card">01</div>
      <div class="card">11</div>
      <div class="card">11</div>
      <div>
        <p>You</p>
        <p>Points: 010</p>
      </div>
    </div>

    <div id="game-state">
      <div class="card">1</div>
      <div class="card">0</div>
      <div class="card">0</div>
      <div class="card">1</div>
    </div>

    <div id="last-card">
      <h1>Last Card:</h1>
      <div class="card">10</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "Game",
  mounted() {
    console.log("Game");
  },
});
</script>
<style lang="scss" scoped>
$factor: 0.4;
$width: 59mm;
$height: 86mm;

body {
  color: black;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}

.card {
  width: calc(59mm * #{$factor});
  height: calc(86mm * #{$factor});
  background: #000;
  display: inline-block;
  border-radius: 5%;
  line-height: calc(#{$height} * #{$factor});
  text-align: center;
  font-size: 64px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  max-height: 100vh;
}

#top-cards {
  grid-column-start: 2;
  grid-column-end: 5;
}
#right-cards {
  grid-column-start: 5;
  align-items: flex-end;
}
#bottom-cards {
  grid-column-start: 2;
  grid-column-end: 5;
  grid-row-start: 4;
  align-items: flex-end;
}

#bottom-cards .card,
#game-state .card,
#last-card .card {
  background: white;
  box-shadow: 0 0 0 1pt black;
}

#top-cards,
#bottom-cards {
  display: flex;
  gap: 12px;
  justify-content: center;
}

#left-cards,
#right-cards {
  grid-row-start: 2;
  grid-row-end: 4;
  display: flex;
  flex-direction: column;

  .card {
    width: calc(#{$height} * #{$factor});
    height: calc(#{$width} * #{$factor});
    display: block;
    &:not(:nth-last-of-type(2)) {
      margin-bottom: 12px;
    }
  }
}

#game-state {
  grid-column-start: 2;
  grid-column-end: 4;
  grid-row-start: 2;
  display: flex;
  gap: 20px;
  align-items: flex-end;
  justify-content: center;
}

#last-card {
  grid-column-start: 4;
  grid-column-end: 5;
  grid-row-start: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  gap: 20px;
  h1 {
    color: white;
    text-shadow: #000 02px 1px 1px;
  }
}

p {
  color: white;
  font-size: 20px;
  text-shadow: #000 02px 1px 1px;
}
</style>