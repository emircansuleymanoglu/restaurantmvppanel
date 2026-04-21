import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventsGateway } from '../gateway/events.gateway';
import { ProductsService } from './products.service';

class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private eventsGateway: EventsGateway,
  ) {}

  @Get()
  findAll(@Request() req) {
    return this.productsService.findAll(req.user.restaurantId);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateProductDto) {
    const product = await this.productsService.create(req.user.restaurantId, dto);
    this.eventsGateway.emitUpdate(req.user.restaurantId, { type: 'product_created', data: product });
    return product;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.update(id, req.user.restaurantId, dto);
    this.eventsGateway.emitUpdate(req.user.restaurantId, { type: 'product_updated', data: product });
    return product;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.productsService.remove(id, req.user.restaurantId);
    this.eventsGateway.emitUpdate(req.user.restaurantId, { type: 'product_deleted', data: { id } });
    return result;
  }
}
