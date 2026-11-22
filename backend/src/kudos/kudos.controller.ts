import { Body, Controller, Post } from '@nestjs/common';
import type { Kudos } from './kudos.js';
import { KudosService } from './kudos.service.js';
import { SendKudosDto } from './send-kudos.dto.js';

@Controller('kudos')
export class KudosController {
  constructor(private readonly kudos: KudosService) {}

  @Post()
  send(@Body() dto: SendKudosDto): Kudos {
    return this.kudos.send(dto);
  }
}
