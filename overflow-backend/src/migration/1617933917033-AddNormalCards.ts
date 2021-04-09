import { Card, CardType } from '../entity/card.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNormalCards1617933917033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const connection = await queryRunner.connection;
    const promises = [];
    for (let i = 1; i <= 4; i++) {
      const card = new Card();
      card.name = i.toString();
      card.image = 'assets/placeholder.jpg';
      card.type = CardType.Normal;
      card.value = i;
      promises.push(connection.manager.save(card));
    }
    await Promise.all(promises);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;
    const promises = [];
    for (let i = 1; i <= 4; i++) {
      promises.push(manager.delete(Card, { name: i.toString() }));
    }
    await Promise.all(promises);
  }
}
