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
        :class="{ 'focused-card': focusedCardIndex === index }"
        @click="focusCard(index)"
      />
      <div>
        <p>{{ store.state.displayName }}</p>
        <p>{{ scoreDisplay(score) }}</p>
      </div>
      <div class="spacer"></div>
      <button
        class="play-card-button"
        v-if="focusedCardIndex >= 0"
        @click="playCard"
      >
        Play <br />
        Card
      </button>
    </div>

    <div id="game-state">
      <card :text="boardNthNumber(3)" :outlined="true" image="score.png" />
      <card :text="boardNthNumber(2)" :outlined="true" image="score.png" />
      <card :text="boardNthNumber(1)" :outlined="true" image="score.png" />
      <card :text="boardNthNumber(0)" :outlined="true" image="score.png" />
    </div>

    <div id="last-card">
      <h1>Last Card:</h1>
      <card
        :image="cardImageUrl(store.state.cardMap[lastPlayedCard]?.image)"
        :outlined="true"
      />
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
      playerMap: {},
      hand: [],
      board: 0,
      score: 0,
      focusedCardIndex: -1,
      lastSubmittedCardIndex: -1,
      lastPlayedCard: "",
      allowedToAct: false,
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
      for (let i = 0; i < this.players.length; i++) {
        this.playerMap[this.players[i].playerId] = i;
      }
      this.hand = hand;
    },
    playerScored({
      playerId,
      newScore,
    }: {
      playerId: string;
      newScore: number;
    }) {
      if (playerId == this.$socket.id) this.score = newScore;
      else this.players[this.playerMap[playerId]].score = newScore;
    },
    boardUpdated({ newScore }: { newScore: number }) {
      this.board = newScore;
    },
    playerWon({ player }: { player: string }) {
      alert(`Player ${player} has won!`);
      this.store.state.lobbyCode = "";
      this.$router.push({ name: "LobbyMenu" });
    },
    cardDrawn({ playerId, cardId }: { playerId: string; cardId: number }) {
      if (playerId == this.$socket.id) {
        this.hand.push(cardId);
        console.log(cardId);
      } else {
        this.players[this.playerMap[playerId]].numberOfCards += 1;
      }
    },
    cardPlayed({
      playerId,
      cardId,
      handSize,
    }: {
      playerId: string;
      cardId: number;
      handSize: number;
    }) {
      if (playerId === this.$socket.id) {
        if (cardId === this.hand[this.lastSubmittedCardIndex]) {
          this.hand.splice(this.lastSubmittedCardIndex, 1);
        }
        this.focusedCardIndex = -1;
        this.lastSubmittedCardIndex = -1;
      } else {
        this.players[this.playerMap[playerId]].numberOfCards = handSize;
        // TODO: Implement in a future sprint
      }
      this.lastPlayedCard = cardId;
    },
    actionGiven() {
      this.allowedToAct = true;
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
      return `${import.meta.env.VITE_HOST}:${
        // @ts-ignore
        import.meta.env.VITE_BACKEND_PORT
      }/${url}`;
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
    focusCard(index: number) {
      if (!this.allowedToAct) return;
      this.focusedCardIndex = index;
    },
    unfocusCard(event: Event) {
      if (!event.target) return;
      const target = event.target as HTMLElement;
      if (!target.classList) return;
      const ignoredClasses = ["card", "play-card-button"];
      const classes = Array.from(target.classList);
      const intersection = classes.filter((cls) =>
        ignoredClasses.includes(cls)
      );
      if (intersection.length === 0) this.focusedCardIndex = -1;
    },
    drawCards(cardsToDraw: number) {
      this.$socket.emit("drawCards", {
        lobbyCode: this.store.state.lobbyCode,
        cardsToDraw: 1,
        playerId: this.$socket.id,
      });
      this.allowedToAct = false;
    },
    playCard() {
      if (this.focusedCardIndex < 0 || !this.allowedToAct) return;
      this.lastSubmittedCardIndex = this.focusedCardIndex;
      this.$socket.emit("playCard", {
        lobbyCode: this.store.state.lobbyCode,
        playerId: this.$socket.id,
        cardIndex: this.focusedCardIndex,
      });
      this.allowedToAct = false;
    },
  },
  mounted() {
    this.$socket.emit("getGameData", this.store.state.lobbyCode);
    document.body.addEventListener("click", this.unfocusCard);
  },
});
</script>
<style lang="scss" scoped>
@import "../scss/_variables.scss";
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

  .card:hover {
    cursor: pointer;
  }
}

#top-cards,
#bottom-cards {
  display: flex;
  gap: 12px;
  align-items: center;
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
    color: $text-color;
    text-shadow: white 2px 1px 1px;
  }
}

p {
  font-size: 20px;
  color: $text-color;
  text-shadow: white 2px 1px 1px;
}

.card {
  transform: scale(1) translateY(0);
  transition: transform 0.1s;
  &.focused-card {
    transform: scale(1.4) translateY(-30px);
  }
}

.play-card-button {
  margin: 32px;
  font-size: 24px;
  background: green;
  border: 1px solid black;
  border-radius: 5px;
  cursor: pointer;
  color: white;
}
</style>