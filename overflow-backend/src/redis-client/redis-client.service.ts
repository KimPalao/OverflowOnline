import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisClientService {
  // TODO: Use an environment variable
  private client = createClient({ host: process.env.REDIS_HOST });

  async get(key: string): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }

  async set(key: string, value: any): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.client.set(key, value, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async hset(key: string, value: any): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.client.hset(key, value, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async rpush(key: string, value: any): Promise<number> {
    return await new Promise((resolve, reject) => {
      this.client.rpush(key, value, (err, val) => {
        if (err) reject(err);
        resolve(val);
      });
    });
  }

  async exists(key: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      this.client.exists(key, (err, value) => {
        if (err) reject(err);
        resolve(value === 1);
      });
    });
  }

  // Lobby / Game functions

  async setName(playerId: string, name: string) {
    return await this.client.set(`${playerId}-display-name`, name);
  }

  async gameExists(lobbyCode: string): Promise<boolean> {
    return await this.exists(`game-${lobbyCode}`);
  }

  async createNewGame(lobbyCode: string, hostId: string) {
    const multi = this.client.multi();
    multi.hmset(
      `game-${lobbyCode}`,
      'host',
      hostId,
      'code',
      lobbyCode,
      'active',
      '0',
    );
    multi.rpush(`game-${lobbyCode}-players`, hostId);
    multi.set(`host-${hostId}`, lobbyCode);
    return await new Promise((resolve, reject) => {
      multi.exec((err, val) => {
        if (err) reject(err);
        console.log(val);
        resolve(val);
      });
    });
  }

  async getGameOfHost(hostId: string): Promise<string> {
    return await this.get(`host-${hostId}`);
  }

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

  async joinGame(lobbyCode: string, playerId: string) {
    await this.rpush(`game-${lobbyCode}-players`, playerId);
  }
}
