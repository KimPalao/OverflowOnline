import { Injectable } from '@nestjs/common';
import { ConnectionManager, Connection, EntityManager } from 'typeorm';

/**
 * A wrapper for the database module
 * This allows the database connection error to be handled
 */
@Injectable()
export class DbClientService {
  private connection: Connection;

  constructor() {
    const connectionManager = new ConnectionManager();
    this.connection = connectionManager.create({
      name: 'default',
      type: 'mongodb',
      host: process.env.MONGO_INITDB_HOST,
      port: 27017,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      database: process.env.MONGO_INITDB_DATABASE,
      username: process.env.MONGO_INITDB_ROOT_USERNAME,
      password: process.env.MONGO_INITDB_ROOT_PASSWORD,
    });
  }

  /**
   * A wrapper for connecting to the database and returning an EntityManager
   *
   * @returns EntityManager of the eonnection, or null if an error occurred
   */
  async manager(): Promise<EntityManager | null> {
    try {
      await this.connection.connect();
      return this.connection.manager;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
