import { Card, CardType } from '../entity/card.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllNormalCards1621503432154 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;
    const cards = await manager.find(Card);
    for (const card of cards) {
      await manager.remove(card);
    }
    const promises = [];
    for (let i = 0; i <= 8; i++) {
      const card = new Card();
      card.name = i.toString();
      card.image = `assets/input${i}.png`;
      card.type = CardType.Normal;
      card.value = i;
      promises.push(manager.save(card));
    }
    await Promise.all(promises);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log();
  }
}
