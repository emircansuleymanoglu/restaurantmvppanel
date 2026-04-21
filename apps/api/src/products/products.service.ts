import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  findAll(restaurantId: string) {
    return this.repo.find({ where: { restaurantId, isActive: true } });
  }

  async create(restaurantId: string, data: Partial<Product>) {
    const product = this.repo.create({ ...data, restaurantId });
    return this.repo.save(product);
  }

  async update(id: string, restaurantId: string, data: Partial<Product>) {
    const product = await this.repo.findOne({ where: { id, restaurantId } });
    if (!product) throw new NotFoundException('Product not found');
    Object.assign(product, data);
    return this.repo.save(product);
  }

  async remove(id: string, restaurantId: string) {
    const product = await this.repo.findOne({ where: { id, restaurantId } });
    if (!product) throw new NotFoundException('Product not found');
    product.isActive = false;
    return this.repo.save(product);
  }
}
