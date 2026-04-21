import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LayoutController } from './layout.controller';
import { PublicLayoutController } from './public-layout.controller';
import { LayoutService } from './layout.service';
import { Layout } from './layout.entity';
import { EventsGateway } from '../gateway/events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Layout])],
  controllers: [LayoutController, PublicLayoutController],
  providers: [LayoutService, EventsGateway],
  exports: [LayoutService],
})
export class LayoutModule {}
