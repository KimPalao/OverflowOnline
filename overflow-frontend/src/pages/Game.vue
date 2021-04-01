<template>
  <div class="grid">
    <div id="top-cards">
      <div class="card" v-for="card in player4.numberOfCards"></div>
      <div>
        <p>{{ player4.displayName }}</p>
        <p v-if="player4.score">{{ scoreDisplay(player4.score) }}</p>
      </div>
    </div>
    <div id="left-cards">
      <div class="card" v-for="card in player2.numberOfCards"></div>
      <div>
        <p>{{ player2.displayName }}</p>
        <p v-if="player2.score">{{ scoreDisplay(player2.score) }}</p>
      </div>
    </div>
    <div id="right-cards">
      <div class="card" v-for="card in player3.numberOfCards"></div>
      <div>
        <p>{{ player3.displayName }}</p>
        <p v-if="player3.score">{{ scoreDisplay(player3.score) }}</p>
      </div>
    </div>
    <div id="bottom-cards">
      <div
        class="card"
        v-for="(card, index) in hand"
        :key="index"
        :style="cardStyle(card.image)"
      ></div>
      <div>
        <p>You</p>
        <p>{{ scoreDisplay(score) }}</p>
      </div>
    </div>

    <div id="game-state">
      <div class="card">{{ boardNthNumber(3) }}</div>
      <div class="card">{{ boardNthNumber(2) }}</div>
      <div class="card">{{ boardNthNumber(1) }}</div>
      <div class="card">{{ boardNthNumber(0) }}</div>
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
  data() {
    return {
      players: [],
      hand: [],
      board: 0,
      score: 6,
    };
  },
  sockets: {
    getGameDataResponse({
      players,
      hand,
    }: {
      players: Array<any>;
      hand: Array<any>;
    }) {
      this.players = players;
      this.hand = hand;
    },
  },
  computed: {
    player2() {
      if (this.players.length > 0) return this.players[0];
      return {};
    },
    player3() {
      if (this.players.length > 1) return this.players[1];
      return {};
    },
    player4() {
      if (this.players.length > 2) return this.players[2];
      return {};
    },
  },
  methods: {
    boardNthNumber(n: number) {
      return (this.board >> n) & 1;
    },
    cardImageUrl(url: string) {
      // @ts-ignore
      return `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/${url}`;
    },
    cardStyle(url: string) {
      return {
        backgroundImage: "url(" + this.cardImageUrl(url) + ")",
        backgroundSize: "cover",
      };
    },
    scoreDisplay(points: number) {
      return points.toString(2).padStart(3, "0");
    },
  },
  mounted() {
    this.$socket.emit("getGameData", this.store.state.lobbyCode);
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