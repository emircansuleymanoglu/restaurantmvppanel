import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/product.entity';
import { Layout } from '../../layout/layout.entity';
import { User } from '../../auth/user.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Product, (p) => p.restaurant)
  products: Product[];

  @OneToMany(() => Layout, (l) => l.restaurant)
  layouts: Layout[];

  @OneToMany(() => User, (u) => u.restaurant)
  users: User[];
}
