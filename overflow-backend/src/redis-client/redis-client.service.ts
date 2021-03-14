import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisClientService {
  // TODO: Use an environment variable
  private client = createClient({ host: 'redis' });

  async get(key: string) {
    return await new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }

  async set(key: string, value: any) {
    await new Promise<void>((resolve, reject) => {
      this.client.set(key, value, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}
