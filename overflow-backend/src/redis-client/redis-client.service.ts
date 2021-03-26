import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

/**
 * A wrapper for the redis client
 */
@Injectable()
export class RedisClientService {
  private client = createClient({ host: process.env.REDIS_HOST });

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

  async getList(key: string) {
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

  async lrem(key: string, count: number, value: string): Promise<boolean> {
    console.log(key, value);
    return await new Promise((resolve, reject) => {
      this.client.lrem(key, count, value, (err, value) => {
        if (err) reject(err);
        resolve(value === 1);
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
  async createNewGame(lobbyCode: string, hostId: string) {
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
    return await new Promise((resolve, reject) => {
      multi.exec((err, val) => {
        if (err) reject(err);
        resolve(val);
      });
    });
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
   * @returns Promise<void>
   */
  async disconnectPlayer(playerId: string) {
    const lobbyCode = this.getGameOfHost(playerId);
    const multi = this.client.multi();
    multi.del(`game-${lobbyCode}`);
    multi.del(`game-${lobbyCode}-players`);
    multi.del(`host-${playerId}`);
    return await new Promise((resolve, reject) => {
      multi.exec((err, val) => {
        if (err) reject(err);
        resolve(val);
      });
    });
  }

  /**
   * Adds a player to a game lobby
   *
   * @param lobbyCode Code of the lobby / game to join
   * @param playerId Socket.IO id of the player
   */
  async joinGame(lobbyCode: string, playerId: string) {
    await this.rpush(`game-${lobbyCode}-players`, playerId);
  }

  async getGamePlayers(lobbyCode: string) {
    const players = await this.getList(`game-${lobbyCode}-players`);
    const playerObjects = [];
    for (const player of players) {
      playerObjects.push({
        playerId: player,
        displayName: await this.getPlayerName(player),
      });
    }
    return playerObjects;
  }

  async kickPlayer(lobbyCode: string, playerId: string) {
    await this.lrem(`game-${lobbyCode}-players`, 0, playerId);
  }
}
