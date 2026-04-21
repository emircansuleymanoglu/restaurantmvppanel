import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('DB connected');

  const restaurantRepo = AppDataSource.getRepository('restaurants');
  const userRepo = AppDataSource.getRepository('users');
  const productRepo = AppDataSource.getRepository('products');
  const layoutRepo = AppDataSource.getRepository('layouts');

  // Create demo restaurant
  let restaurant = await restaurantRepo.findOne({ where: { name: 'Demo Burger House' } });
  if (!restaurant) {
    restaurant = restaurantRepo.create({ name: 'Demo Burger House' });
    restaurant = await restaurantRepo.save(restaurant);
    console.log('Restaurant created:', restaurant.id);
  }

  // Create admin user
  const existing = await userRepo.findOne({ where: { email: 'admin@demo.com' } });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await userRepo.save(
      userRepo.create({ email: 'admin@demo.com', password: hashed, restaurantId: restaurant.id }),
    );
    console.log('User created: admin@demo.com / admin123');
  }

  // Seed products
  const products = [
    { name: 'Classic Burger', price: 12.99, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { name: 'Cheeseburger', price: 14.99, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400' },
    { name: 'BBQ Bacon Burger', price: 16.99, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400' },
    { name: 'Crispy Chicken Sandwich', price: 13.99, imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400' },
    { name: 'Veggie Burger', price: 11.99, imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400' },
    { name: 'French Fries (L)', price: 4.99, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
    { name: 'Onion Rings', price: 5.49, imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400' },
    { name: 'Coca-Cola', price: 2.99, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
  ];

  for (const p of products) {
    const exists = await productRepo.findOne({ where: { restaurantId: restaurant.id, name: p.name } });
    if (!exists) {
      await productRepo.save(productRepo.create({ ...p, restaurantId: restaurant.id }));
    }
  }
  console.log('Products seeded');

  // Seed default layout
  const existingLayout = await layoutRepo.findOne({ where: { restaurantId: restaurant.id } });
  if (!existingLayout) {
    const allProducts = await productRepo.find({ where: { restaurantId: restaurant.id } });
    const items = allProducts.map((p, i) => ({
      id: p.id,
      productId: p.id,
      x: (i % 4) * 200,
      y: Math.floor(i / 4) * 200,
      w: 180,
      h: 160,
    }));
    await layoutRepo.save(layoutRepo.create({ restaurantId: restaurant.id, layoutJson: { items } }));
    console.log('Layout seeded');
  }

  await AppDataSource.destroy();
  console.log('Seed complete!');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
