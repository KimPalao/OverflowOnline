import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';
import { Card, CardType } from '../entity/card.entity';
import { DbClientService } from '../db-client/db-client.service';
import { SocketEvent } from 'src/types/socket-event';

/**
 * A wrapper for the redis client
 */
@Injectable()
export class RedisClientService {
  private cardMap: Record<string, Card> = {};
  private cardsCached = false;
  constructor(private readonly dbClientService: DbClientService) {}

  async cacheCards() {
    if (this.cardsCached) return;
    const manager = await this.dbClientService.manager();
    const cards = await manager.find(Card);
    for (const card of cards) {
      this.cardMap[card.id.toString()] = card;
    }
    this.cardsCached = true;
  }

  private client = createClient({ host: process.env.REDIS_HOST });

  private logger: Logger = new Logger('RedisClient');

  async execMulti(multi): Promise<void> {
    return await new Promise((resolve, reject) => {
      multi.exec((err, val) => {
        if (err) reject(err);
        resolve(val);
      });
    });
  }

  /**
   * Gets the value stored in `key` from the Redis store
   *
   * @param key - The key of the value to retrieve
   * @returns The value associated with the `key`
   */
  async get(key: string): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }

  /**
   * Stores `value` in the Redis store with the key `key`
   *
   * @param key - The key to set the value of
   * @param value The value to set at `key`
   */
  async set(key: string, value: any): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.client.set(key, value, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  /**
   * Sets key.field = value
   *
   * @param key - The key of the object to store in
   * @param field - The property of the object to set
   * @param value - The value to store
   */
  async hset(key: string, field: string, value: any): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.client.hset(key, field, value, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  /**
   * Gets the value at key.field
   *
   * @param key - The key of the object to store in
   * @param field - The property of the object to set
   */
  async hget(key: string, field: string): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      this.client.hget(key, field, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }

  /**
   * Pushes `value` to the end of the list at `key`
   *
   * @param key - The key of the list to push to
   * @param value - The value to push to the list
   * @returns Length of the list after pushing
   */
  async rpush(key: string, value: any): Promise<number> {
    return await new Promise((resolve, reject) => {
      this.client.rpush(key, value, (err, val) => {
        if (err) reject(err);
        resolve(val);
      });
    });
  }

  /**
   * Returns elements of the list at `key` from index `start` to index `end`, exclusive
   *
   * @param key The key of the list to retrieve
   * @param start The starting index
   * @param end The ending index, exclusive
   * @returns Elements of the array from [start:end]
   */
  async lrange(
    key: string,
    start: number,
    end: number,
  ): Promise<Array<string>> {
    return await new Promise((resolve, reject) => {
      this.client.lrange(key, start, end, (err, val) => {
        if (err) reject(err);
        resolve(val);
      });
    });
  }

  /**
   * Returns the length of the list at `key`
   *
   * @param key The key of the list to check the length of
   * @returns The length of the list
   */
  async llen(key: string): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      this.client.llen(key, (err, value) => {
        if (err) reject(err);
        resolve(parseInt(value));
      });
    });
  }

  /**
   * A shortcut function for returning all the elements of a list at `key`
   *
   * @param key The key of the list to retrieve
   * @returns The full list
   */
  async getList(key: string): Promise<Array<string>> {
    return this.lrange(key, 0, -1);
  }

  /**
   * Checks if `key` exists in the Redis store
   *
   * @param key - The key to check
   * @returns A boolean indicating the existence of `key`
   */
  async exists(key: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      this.client.exists(key, (err, value) => {
        if (err) reject(err);
        resolve(value === 1);
      });
    });
  }

  /**
   * Removes `count` occurrences of `value` from list at `key`
   *
   * @param key - The key of the list to remove an element from
   * @param count - The number of instances to remove, 0 for all
   * @param value - The value to remove
   * @returns A boolean indicating that a value was removed
   */
  async lrem(key: string, count: number, value: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      this.client.lrem(key, count, value, (err, value) => {
        if (err) reject(err);
        resolve(value > 0);
      });
    });
  }

  // Lobby / Game functions

  /**
   * Sets the name of the player
   *
   * @param playerId The Socket.IO id of the player
   * @param name Name of the player
   * @returns Promise<void>
   */
  async setName(playerId: string, name: string): Promise<void> {
    return await this.client.set(`${playerId}-display-name`, name);
  }

  /**
   * Checks if a game exists by its code
   *
   * @param lobbyCode Code of the lobby / game
   * @returns Boolean indicating if the lobby / game exists
   */
  async gameExists(lobbyCode: string): Promise<boolean> {
    return await this.exists(`game-${lobbyCode}`);
  }

  /**
   * Creates a new game
   *
   * @param lobbyCode Code of the lobby / game
   * @param hostId Socket.IO id of the host
   * @returns Promise<void>
   */
  async createNewGame(lobbyCode: string, hostId: string): Promise<void> {
    // Start a transaction
    const multi = this.client.multi();

    // Set `game-${lobbyCode}` = {host: hostId, code: lobbyCode, active: '0'}
    multi.hmset(
      `game-${lobbyCode}`,
      'host',
      hostId,
      'code',
      lobbyCode,
      'active',
      '0',
    );
    // Set `game-${lobbyCode}-players` = [hostId]
    multi.rpush(`game-${lobbyCode}-players`, hostId);
    // Set `host-${hostId}` = lobbyCode
    multi.set(`host-${hostId}`, lobbyCode);
    return await this.execMulti(multi);
  }

  /**
   * Returns the lobby code that the host is a part of
   *
   * @param hostId Socket.IO id of the host
   * @returns Promise<string>`
   */
  async getGameOfHost(hostId: string): Promise<string> {
    return await this.get(`host-${hostId}`);
  }

  async getHostOfGame(lobbyCode: string): Promise<string> {
    return await this.hget(`game-${lobbyCode}`, 'host');
  }

  /**
   * Returns the name of a player given their Socket.IO id
   *
   * @param playerId Socket.IO id of the player
   * @returns The name of the player
   */
  async getPlayerName(playerId: string): Promise<string> {
    return await this.get(`${playerId}-display-name`);
  }

  /**
   * Cleans up resources used by the user
   *
   * @param playerId Socket.IO id of the player
   */
  async disconnectPlayer(playerId: string): Promise<void> {
    // Get the lobby code that the player is a host of
    // so it can be freed from memory if it exists
    const lobbyCode = await this.getGameOfHost(playerId);
    this.logger.debug(`Removing game: ${lobbyCode}`);
    // Start a transaction
    const multi = this.client.multi();
    // Remove the player information
    multi.del(`${playerId}-display-name`);
    // Remove the game information
    multi.del(`game-${lobbyCode}`);
    // Remove the game player list
    multi.del(`game-${lobbyCode}-players`);
    // Remove the host-lobby mapping
    multi.del(`host-${playerId}`);
    return await this.execMulti(multi);
  }

  /**
   * Adds a player to a game lobby
   *
   * @param lobbyCode Code of the lobby / game to join
   * @param playerId Socket.IO id of the player
   */
  async joinGame(lobbyCode: string, playerId: string): Promise<void> {
    await this.rpush(`game-${lobbyCode}-players`, playerId);
  }

  /**
   * Returns the list of players in a game
   *
   * @param lobbyCode - The code of the lobby / game to retrieve players from
   * @returns - The list of players
   */
  async getGamePlayers(
    lobbyCode: string,
  ): Promise<Array<{ playerId: string; displayName: string }>> {
    const players = await this.getList(`game-${lobbyCode}-players`);
    const playerObjects = [];
    for (const player of players) {
      // Get the display name of each user
      playerObjects.push({
        playerId: player,
        displayName: await this.getPlayerName(player),
      });
    }
    return playerObjects;
  }

  /**
   * Removes a player from a game's list of players
   *
   * @param lobbyCode The code of the lobby / game to remove players from
   * @param playerId The Socket.IO id of the player
   */
  async kickPlayer(lobbyCode: string, playerId: string): Promise<void> {
    await this.lrem(`game-${lobbyCode}-players`, 0, playerId);
  }

  /**
   * Counts the number of players assigned to a game
   *
   * @param lobbyCode The code of the lobby / game to count players of
   * @returns Number of players in a lobby / game
   */
  async getNumberOfPlayers(lobbyCode: string): Promise<number> {
    return await this.llen(`game-${lobbyCode}-players`);
  }

  /**
   * Sets a game as "active"
   *
   * @param lobbyCode The code of the game to set as active
   */
  async startGame(lobbyCode: string): Promise<void> {
    // Start a transaction
    const multi = this.client.multi();

    multi.hmset(`game-${lobbyCode}`, 'active', '1', 'score', '0');
    // Get players
    const players = await this.getGamePlayers(lobbyCode);
    // Get cards
    const manager = await this.dbClientService.manager();
    const cards = await manager.find(Card);
    // assign cards
    for (const player of players) {
      for (let i = 0; i < 5; i++) {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        multi.rpush(
          `game-${lobbyCode}-player-${player.playerId}-hand`,
          randomCard.id.toString(),
        );
      }
      multi.hset(`game-${lobbyCode}-score`, player.playerId, 0);
    }
    return await this.execMulti(multi);
  }

  async getGameScore(lobbyCode: string): Promise<number> {
    const scoreStr = await this.hget(`game-${lobbyCode}`, 'score');
    const score = parseInt(scoreStr);
    if (isNaN(score)) return 0;
    return score;
  }

  async setGameScore(lobbyCode: string, score: number): Promise<void> {
    return await this.hset(`game-${lobbyCode}`, 'score', score.toString());
  }

  async getPlayerScore(lobbyCode: string, playerId: string): Promise<number> {
    const score = parseInt(
      await this.hget(`game-${lobbyCode}-score`, playerId),
    );
    if (isNaN(score)) return 0;
    return score;
  }

  async getGamePlayerData(lobbyCode: string) {
    const players = await this.getGamePlayers(lobbyCode);
    const playerData = [];
    for (const player of players) {
      playerData.push({
        ...player,
        numberOfCards: await this.getPlayerHandCount(
          lobbyCode,
          player.playerId,
        ),
        score: await this.getPlayerScore(lobbyCode, player.playerId),
      });
    }
    return playerData;
  }

  async getPlayerHandCount(lobbyCode: string, playerId: string) {
    return await this.llen(`game-${lobbyCode}-player-${playerId}-hand`);
  }

  async getPlayerHand(
    lobbyCode: string,
    playerId: string,
  ): Promise<Array<string>> {
    return await this.getList(`game-${lobbyCode}-player-${playerId}-hand`);
  }

  async playCard(
    lobbyCode: string,
    playerId: string,
    cardIndex: number,
  ): Promise<Array<SocketEvent>> {
    await this.cacheCards();
    const emitQueue: Array<SocketEvent> = [];
    const players = await this.getGamePlayers(lobbyCode);
    const multi = this.client.multi();
    // get player's hand
    const hand = await this.getPlayerHand(lobbyCode, playerId);
    // get card
    const cardId = hand.splice(cardIndex, 1)[0];
    const card = this.cardMap[cardId];
    emitQueue.push({
      event: 'cardPlayed',
      data: {
        playerId,
        cardId,
        handSize: hand.length,
      },
    });
    // check card type
    switch (card.type) {
      case CardType.Normal:
        let score = await this.getGameScore(lobbyCode);
        score += card.value;
        if (score === 15) {
          // 1111
          score %= 16;
          emitQueue.push({
            event: 'playerScored',
            data: {
              playerId,
              newScore: (await this.getPlayerScore(lobbyCode, playerId)) + 1,
            },
          });
        } else if (score >= 16) {
          // Overflow
          score %= 16;
          for (const player of players) {
            if (player.playerId === playerId) continue;
            emitQueue.push({
              event: 'playerScored',
              data: {
                playerId: player.playerId,
                newScore:
                  (await this.getPlayerScore(lobbyCode, player.playerId)) + 1,
              },
            });
          }
        }
        emitQueue.push({
          event: 'boardUpdated',
          data: {
            newScore: score,
          },
        });
        multi.hset(`game-${lobbyCode}`, 'score', score.toString());
        break;
      case CardType.Combo:
        // TODO: Implement in a future sprint
        break;
      case CardType.Special:
        // TODO: Implement in a future sprint
        break;
      default:
        throw new RangeError('Card Type not supported');
    }
    multi.del(`game-${lobbyCode}-player-${playerId}-hand`);
    multi.rpush(`game-${lobbyCode}-player-${playerId}-hand`, hand);
    await this.execMulti(multi);
    return emitQueue;
  }
}
