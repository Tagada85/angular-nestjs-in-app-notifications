import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const KUDOS_MESSAGE_MAX_LENGTH = 280;

export class SendKudosDto {
  // Demo only: the sender comes from the request.
  // A real app takes it from the authenticated session.
  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(KUDOS_MESSAGE_MAX_LENGTH)
  message: string;
}
