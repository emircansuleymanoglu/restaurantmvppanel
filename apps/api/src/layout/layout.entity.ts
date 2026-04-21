import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Restaurant } from '../common/entities/restaurant.entity';

@Entity('layouts')
export class Layout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  restaurantId: string;

  @Column({ type: 'jsonb', default: '{"items":[]}' })
  layoutJson: object;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Restaurant, (r) => r.layouts)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}
