import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('public')
export class PublicProductsController {
  constructor(private productsService: ProductsService) {}

  @Get(':restaurantId/products')
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.productsService.findAll(restaurantId);
  }
}
