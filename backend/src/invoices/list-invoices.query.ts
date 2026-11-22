import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ListInvoicesQuery {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientId?: string;
}
