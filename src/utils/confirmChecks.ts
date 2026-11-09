import moment from 'moment';

// Typo checks for the "Check before saving" sheet. They only warn; the
// promoter can still confirm.

export type CheckRow = {
  name: string;
  qty: number;
  /** The item's usual figure in this store; skipped when unknown or 0. */
  usual?: number;
  /** Daily Sales: everything on the shelf, to flag selling all of it. */
  shelf?: number;
};

export const BIG_QTY = 100;
export const USUAL_FACTOR = 5;

export const typoWarnings = (rows: CheckRow[]): string[] => {
  const out: string[] = [];
  rows.forEach(({name, qty, usual, shelf}) => {
    if (!(qty > 0)) {
      return;
    }
    const usualRounded =
      usual && usual > 0 ? Math.max(1, Math.round(usual)) : 0;
    if (usualRounded && qty > USUAL_FACTOR * usualRounded) {
      out.push(`Check: ${qty} pcs of ${name}, usually about ${usualRounded}.`);
    } else if (qty >= BIG_QTY) {
      out.push(`Check: ${qty} pcs of ${name}.`);
    }
    if (shelf != null && shelf > 0 && qty === shelf) {
      out.push(`Check: ${qty} pcs of ${name} is the whole shelf.`);
    }
  });
  return out;
};

type DatedRow = {
  posting_date: string;
  name?: string;
  items?: {item_code: string; qty: number}[];
};

// Average quantity per entry of each item in the last 30 days, from a
// History list the app already loads (e.g. deliveries).
export const usualPerEntry = (
  entries: DatedRow[] | undefined,
  skipName?: string,
): Record<string, number> => {
  const since = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const sums: Record<string, {total: number; count: number}> = {};
  (entries ?? []).forEach(entry => {
    if (entry.name === skipName || (entry.posting_date ?? '') < since) {
      return;
    }
    const perEntry: Record<string, number> = {};
    (entry.items ?? []).forEach(item => {
      perEntry[item.item_code] =
        (perEntry[item.item_code] ?? 0) + Number(item.qty || 0);
    });
    Object.entries(perEntry).forEach(([code, qty]) => {
      if (!sums[code]) {
        sums[code] = {total: 0, count: 0};
      }
      const s = sums[code];
      s.total += qty;
      s.count += 1;
    });
  });
  const out: Record<string, number> = {};
  Object.entries(sums).forEach(([code, {total, count}]) => {
    if (count) {
      out[code] = total / count;
    }
  });
  return out;
};

// "Receive Stock · Sonamukhi Store · 9 Nov 2026"
export const confirmHeader = (
  action: string,
  storeName: string | undefined,
  date: string | undefined,
) =>
  [action, storeName, moment(date || undefined).format('D MMM YYYY')]
    .filter(Boolean)
    .join(' · ');
