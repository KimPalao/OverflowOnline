import { Card } from '../entity/card.entity';
import {
  createConnection,
  getManager,
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class cardPlaceholder1617540386005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const connection = await queryRunner.connection;
    const placeholder = new Card();
    placeholder.name = 'Placeholder';
    placeholder.image = 'assets/placeholder.jpg';
    await connection.manager.save(placeholder);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;
    await manager.delete(Card, { name: 'Placeholder' });
  }
}
