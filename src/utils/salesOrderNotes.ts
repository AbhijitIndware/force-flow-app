import {getServerBody} from './errorMessage';

// Item codes from `blocked_items` / `not_counted` (strings or {item_code}).
const toCodes = (list: unknown): string[] =>
  Array.isArray(list)
    ? list
        .map(entry =>
          typeof entry === 'string' ? entry : (entry as any)?.item_code,
        )
        .filter((code): code is string => typeof code === 'string' && !!code)
    : [];

// Reads the per-item answers of create/update_sales_order_with_stock, from a
// response or a thrown error. The lists may sit on `message` or `message.data`.
export function getSalesOrderItemAnswers(resOrError: any): {
  blocked: string[];
  notCounted: string[];
} {
  const body = getServerBody(resOrError);
  return {
    blocked: toCodes(body?.data?.blocked_items ?? body?.blocked_items),
    notCounted: toCodes(body?.data?.not_counted ?? body?.not_counted),
  };
}

export function buildItemNotes(
  blocked: string[],
  notCounted: string[] = [],
): Record<string, string> {
  const notes: Record<string, string> = {};
  notCounted.forEach(code => {
    notes[code] = 'Stock kept by Daily Sales; count not taken.';
  });
  blocked.forEach(code => {
    notes[code] = 'Physical stock update required before ordering.';
  });
  return notes;
}
