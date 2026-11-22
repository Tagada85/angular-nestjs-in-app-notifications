import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { toSummary } from '../users/user.js';
import { UsersService } from '../users/users.service.js';
import type { Kudos } from './kudos.js';
import type { SendKudosDto } from './send-kudos.dto.js';

@Injectable()
export class KudosService {
  constructor(private readonly users: UsersService) {}

  send({ fromUserId, toUserId, message }: SendKudosDto): Kudos {
    // Names and emails come from our own user list, never from the request.
    const from = this.users.findById(fromUserId);
    const to = this.users.findById(toUserId);
    if (!from || !to) throw new BadRequestException('Unknown user');
    if (from.id === to.id) throw new BadRequestException('You cannot send kudos to yourself');

    return {
      id: randomUUID(),
      from: toSummary(from),
      to: toSummary(to),
      message,
      sentAt: new Date().toISOString(),
    };
  }
}
