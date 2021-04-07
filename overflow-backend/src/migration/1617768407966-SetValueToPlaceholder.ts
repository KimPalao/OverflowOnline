import { Card, CardType } from '../entity/card.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetValueToPlaceholder1617768407966 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;
    const placeholder = await manager.findOne(Card, { name: 'Placeholder' });
    placeholder.type = CardType.Normal;
    placeholder.value = 1;
    await manager.save(placeholder);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;
    const placeholder = await manager.findOne(Card, { name: 'Placeholder' });
    placeholder.type = null;
    placeholder.value = null;
    await manager.save(placeholder);
  }
}
