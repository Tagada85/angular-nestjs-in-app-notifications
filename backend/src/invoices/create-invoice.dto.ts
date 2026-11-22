import { Transform } from 'class-transformer';
import { IsISO8601, IsInt, IsNotEmpty, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export const INVOICE_DESCRIPTION_MAX_LENGTH = 200;
/** 1,000,000.00: a guard against typos, not a business rule. */
export const INVOICE_MAX_AMOUNT_IN_CENTS = 100_000_000;

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(INVOICE_DESCRIPTION_MAX_LENGTH)
  description: string;

  @IsInt()
  @Min(1)
  @Max(INVOICE_MAX_AMOUNT_IN_CENTS)
  amountInCents: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueDate must be a date in the YYYY-MM-DD format' })
  @IsISO8601({ strict: true })
  dueDate: string;
}
