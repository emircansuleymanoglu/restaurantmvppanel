import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { PublicProductsController } from './public-products.controller';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { EventsGateway } from '../gateway/events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController, PublicProductsController],
  providers: [ProductsService, EventsGateway],
  exports: [ProductsService],
})
export class ProductsModule {}
