import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { LayoutModule } from './layout/layout.module';
import { EventsGateway } from './gateway/events.gateway';
import { Restaurant } from './common/entities/restaurant.entity';
import { Product } from './products/product.entity';
import { Layout } from './layout/layout.entity';
import { User } from './auth/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Restaurant, Product, Layout, User],
      synchronize: true,
    }),
    AuthModule,
    ProductsModule,
    LayoutModule,
  ],
  providers: [EventsGateway],
})
export class AppModule {}
