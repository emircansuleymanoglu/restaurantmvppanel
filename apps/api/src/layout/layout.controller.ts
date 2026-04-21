import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventsGateway } from '../gateway/events.gateway';
import { LayoutService } from './layout.service';

@Controller('layout')
@UseGuards(JwtAuthGuard)
export class LayoutController {
  constructor(
    private layoutService: LayoutService,
    private eventsGateway: EventsGateway,
  ) {}

  @Get()
  get(@Request() req) {
    return this.layoutService.findByRestaurant(req.user.restaurantId);
  }

  @Post()
  async save(@Request() req, @Body() body: { layoutJson: object }) {
    const layout = await this.layoutService.save(req.user.restaurantId, body.layoutJson);
    this.eventsGateway.emitUpdate(req.user.restaurantId, { type: 'layout_updated', data: layout });
    return layout;
  }
}
