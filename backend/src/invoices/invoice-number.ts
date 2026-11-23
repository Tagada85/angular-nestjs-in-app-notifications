/** 1 to 32 letters, digits, dashes or slashes, starting with a letter or a digit: INV-2026-0001, 2026/042… */
export const INVOICE_NUMBER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/-]{0,31}$/;

/** Two numbers that differ only by their case are the same number: INV-2026-0001 = inv-2026-0001. */
export function isSameInvoiceNumber(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * The number the billing form proposes: the one after the highest INV-<year>-NNNN of the current year.
 * Numbers typed in another format (ACME-7) and the previous years' numbers do not count.
 */
export function suggestNextInvoiceNumber(existingNumbers: readonly string[], now: Date): string {
  const year = now.getUTCFullYear();
  const ofThisYear = new RegExp(`^INV-${year}-(\\d+)$`, 'i');
  const highest = existingNumbers.reduce((max, number) => {
    const match = ofThisYear.exec(number);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `INV-${year}-${String(highest + 1).padStart(4, '0')}`;
}
