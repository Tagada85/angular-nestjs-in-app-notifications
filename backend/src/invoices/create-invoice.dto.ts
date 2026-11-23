import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsISO8601, IsInt, IsNotEmpty, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { INVOICE_CURRENCIES, type InvoiceCurrency } from './invoice.js';
import { INVOICE_NUMBER_PATTERN } from './invoice-number.js';

export const INVOICE_DESCRIPTION_MAX_LENGTH = 200;
/** 1,000,000.00: a guard against typos, not a business rule. */
export const INVOICE_MAX_AMOUNT_IN_CENTS = 100_000_000;

const trim = ({ value }: TransformFnParams): unknown => (typeof value === 'string' ? value.trim() : value);

export class CreateInvoiceDto {
  @Transform(trim)
  @IsString()
  @Matches(INVOICE_NUMBER_PATTERN, { message: 'number must be 1 to 32 letters, digits, dashes or slashes' })
  number: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(INVOICE_DESCRIPTION_MAX_LENGTH)
  description: string;

  @IsInt()
  @Min(1)
  @Max(INVOICE_MAX_AMOUNT_IN_CENTS)
  amountInCents: number;

  @IsIn(INVOICE_CURRENCIES)
  currency: InvoiceCurrency;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueDate must be a date in the YYYY-MM-DD format' })
  @IsISO8601({ strict: true })
  dueDate: string;
}
