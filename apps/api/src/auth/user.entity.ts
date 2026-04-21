import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Restaurant } from '../common/entities/restaurant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  restaurantId: string;

  @ManyToOne(() => Restaurant, (r) => r.users)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}
