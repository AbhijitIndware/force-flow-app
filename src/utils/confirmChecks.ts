import moment from 'moment';

// Typo checks for the "Check before saving" sheet. They only warn; the
// promoter can still confirm.

export type CheckRow = {
  name: string;
  qty: number;
  /** The item's usual figure in this store over the last 30 days. */
  usual?: number;
  /** How many entries `usual` was worked out from (last 30 days). */
  entries?: number;
  /** Daily Sales: everything on the shelf, to flag selling all of it. */
  shelf?: number;
};

export const BIG_QTY = 100;
export const USUAL_FACTOR = 5;
// Fewer entries than this is not enough history to call anything "usual":
// a new store, a new promoter, an item that hasn't moved.
export const MIN_USUAL_ENTRIES = 3;

export const typoWarnings = (rows: CheckRow[]): string[] => {
  const out: string[] = [];
  rows.forEach(({name, qty, usual, entries, shelf}) => {
    if (!(qty > 0)) {
      return;
    }
    const enoughHistory =
      (entries ?? 0) >= MIN_USUAL_ENTRIES && usual != null && usual > 0;
    // Never "usually about 0": small averages round up to 1.
    const usualRounded = enoughHistory
      ? Math.max(1, Math.round(usual as number))
      : 0;
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

export type Usual = {usual: number; entries: number};

// Average quantity per entry of each item in the last 30 days, from a
// History list the app already loads (e.g. deliveries), with how many
// entries it comes from.
export const usualPerEntry = (
  entries: DatedRow[] | undefined,
  skipName?: string,
): Record<string, Usual> => {
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
  const out: Record<string, Usual> = {};
  Object.entries(sums).forEach(([code, {total, count}]) => {
    if (count) {
      out[code] = {usual: total / count, entries: count};
    }
  });
  return out;
};

type SelloutStore = {
  store?: string;
  items?: {item_code: string; sold?: number}[];
  days?: {date: string; sold?: number}[];
};

// Daily Sales: each item's usual day at a store from get_my_sales over the
// last 30 days. Sales are kept per item for the period and per day for the
// whole store, so an "entry" is a day the store recorded sales, and the
// usual day is the item's sales spread over those days.
export const usualDailySales = (
  stores: SelloutStore[] | undefined,
  store: string,
): Record<string, Usual> => {
  const row = (stores ?? []).find(s => s.store === store);
  if (!row) {
    return {};
  }
  const saleDays = (row.days ?? []).filter(d => Number(d.sold || 0) > 0).length;
  const out: Record<string, Usual> = {};
  if (!saleDays) {
    return out;
  }
  (row.items ?? []).forEach(item => {
    const sold = Number(item.sold || 0);
    if (sold > 0) {
      out[item.item_code] = {usual: sold / saleDays, entries: saleDays};
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
