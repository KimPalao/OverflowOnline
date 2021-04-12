import { Entity, Column, ObjectID, ObjectIdColumn } from 'typeorm';
/**
 * Wrapper for cards to be played
 */
@Entity()
export class Card {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  type: number;

  @Column()
  value: number;

  get typeVerbose() {
    switch (this.type) {
      case CardType.Normal:
        return 'normal';
      case CardType.Combo:
        return 'combo';
      case CardType.Special:
        return 'special';
      default:
        throw new RangeError('Card type not supported');
    }
  }
}

export enum CardType {
  Normal = 0,
  Combo = 1,
  Special = 2,
}
