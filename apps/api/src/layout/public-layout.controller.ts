import { Controller, Get, Param } from '@nestjs/common';
import { LayoutService } from './layout.service';

@Controller('public')
export class PublicLayoutController {
  constructor(private layoutService: LayoutService) {}

  @Get(':restaurantId/layout')
  get(@Param('restaurantId') restaurantId: string) {
    return this.layoutService.findByRestaurant(restaurantId);
  }
}
