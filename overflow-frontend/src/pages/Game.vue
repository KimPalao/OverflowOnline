<template>
  <div class="grid">
    <div id="top-cards">
      <card v-for="card in player4.numberOfCards" :obscured="true" />
      <div>
        <p>{{ player4.displayName }}</p>
        <p v-if="scoreExists(player4.score)">
          {{ scoreDisplay(player4.score) }}
        </p>
      </div>
    </div>
    <div id="left-cards">
      <!-- <div class="card" v-for="card in player2.numberOfCards"></div> -->
      <card
        v-for="card in player2.numberOfCards"
        :obscured="true"
        :horizontal="true"
      />
      <div>
        <p>{{ player2.displayName }}</p>
        <p v-if="scoreExists(player2.score)">
          {{ scoreDisplay(player2.score) }}
        </p>
      </div>
    </div>
    <div id="right-cards">
      <card
        v-for="card in player3.numberOfCards"
        :obscured="true"
        :horizontal="true"
      />
      <div>
        <p>{{ player3.displayName }}</p>
        <p v-if="scoreExists(player3.score)">
          {{ scoreDisplay(player3.score) }}
        </p>
      </div>
    </div>
    <div id="bottom-cards">
      <card
        v-for="(card, index) in hand"
        :key="index"
        :image="cardImageUrl(store.state.cardMap[card].image)"
        :outlined="true"
      />
      <div>
        <p>{{ store.state.displayName }}</p>
        <p>{{ scoreDisplay(score) }}</p>
      </div>
    </div>

    <div id="game-state">
      <card :text="boardNthNumber(3)" :outlined="true" />
      <card :text="boardNthNumber(2)" :outlined="true" />
      <card :text="boardNthNumber(1)" :outlined="true" />
      <card :text="boardNthNumber(0)" :outlined="true" />
    </div>

    <div id="last-card">
      <h1>Last Card:</h1>
      <card text="" :outlined="true" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import Card from "../components/Card.vue";

export default defineComponent({
  name: "Game",
  components: {
    Card,
  },
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
      this.players = players.filter((p) => p.playerId !== this.$socket.id);
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
    scoreExists(score: any) {
      return !isNaN(score) && typeof score === "number";
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