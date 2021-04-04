import { Entity, Column, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Card {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  name: string;

  @Column()
  image: string;
}
