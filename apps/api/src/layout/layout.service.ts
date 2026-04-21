import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Layout } from './layout.entity';

@Injectable()
export class LayoutService {
  constructor(@InjectRepository(Layout) private repo: Repository<Layout>) {}

  async findByRestaurant(restaurantId: string) {
    let layout = await this.repo.findOne({ where: { restaurantId } });
    if (!layout) {
      layout = this.repo.create({ restaurantId, layoutJson: { items: [] } });
      await this.repo.save(layout);
    }
    return layout;
  }

  async save(restaurantId: string, layoutJson: object) {
    let layout = await this.repo.findOne({ where: { restaurantId } });
    if (!layout) {
      layout = this.repo.create({ restaurantId });
    }
    layout.layoutJson = layoutJson;
    return this.repo.save(layout);
  }
}
