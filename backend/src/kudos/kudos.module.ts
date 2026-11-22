import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { KudosController } from './kudos.controller.js';
import { KudosService } from './kudos.service.js';

@Module({
  imports: [UsersModule],
  controllers: [KudosController],
  providers: [KudosService],
})
export class KudosModule {}
