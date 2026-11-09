import moment from 'moment';

import {
  useCancelCustomerReturnMutation,
  useCancelStockReceivedMutation,
  useCancelStockReturnMutation,
} from '../../../features/base/promoter-base-api';
import {StockHistoryEntry} from '../../../types/baseType';
import {
  getSafeServerMessage,
  getUserFacingError,
} from '../../../utils/errorMessage';
import {confirmHeader} from '../../../utils/confirmChecks';
import {ConfirmRow, ConfirmSpec} from '../../ui/ConfirmSaveSheet';

export type MovementType = 'receipt' | 'customer_return' | 'return';

// The screen that records (and corrects) each kind of entry.
export const ROUTE_FOR_TYPE: Record<MovementType, string> = {
  receipt: 'StockReceivedScreen',
  customer_return: 'CustomerReturnScreen',
  return: 'DistributorReturnScreen',
};

export const NOUN_FOR_TYPE: Record<MovementType, string> = {
  receipt: 'delivery',
  customer_return: 'customer return',
  return: 'return',
};

const ACTION_FOR_TYPE: Record<MovementType, string> = {
  receipt: 'Receive Stock',
  customer_return: 'Customer Return',
  return: 'Store Return',
};

// "5 Nov, 12:40"
export const entryWhen = (entry: StockHistoryEntry) =>
  `${moment(entry.posting_date).format('D MMM')}${
    entry.posting_time ? `, ${String(entry.posting_time).slice(0, 5)}` : ''
  }`;

export const correctingLine = (entry: StockHistoryEntry) =>
  `Correcting the entry of ${entryWhen(entry)}`;

export const condKey = (
  itemCode: string,
  condition: 'resaleable' | 'not_resaleable',
) => `${itemCode}|${condition}`;

// Per-item figures of an entry. Customer returns are keyed by item and
// condition ("code|resaleable"), the others by item code.
export const entryFigures = (
  entry: StockHistoryEntry,
  type: MovementType,
): Record<string, number> => {
  const out: Record<string, number> = {};
  const add = (key: string, qty: number) => {
    if (qty) {
      out[key] = (out[key] ?? 0) + qty;
    }
  };
  if (type === 'customer_return') {
    if (entry.by_item?.length) {
      entry.by_item.forEach(row => {
        add(condKey(row.item_code, 'resaleable'), Number(row.can_sell || 0));
        add(
          condKey(row.item_code, 'not_resaleable'),
          Number(row.cant_sell || 0),
        );
      });
    } else {
      (entry.items ?? []).forEach(item =>
        add(
          condKey(
            item.item_code,
            item.condition === 'not_resaleable'
              ? 'not_resaleable'
              : 'resaleable',
          ),
          Number(item.qty || 0),
        ),
      );
    }
    return out;
  }
  (entry.items ?? []).forEach(item =>
    add(item.item_code, Number(item.qty || 0)),
  );
  return out;
};

export const entryItemNames = (entry: StockHistoryEntry) => {
  const names: Record<string, string> = {};
  [...(entry.items ?? []), ...(entry.by_item ?? [])].forEach(item => {
    if (item.item_name) {
      names[item.item_code] = item.item_name;
    }
  });
  return names;
};

// Rows of the cancel confirm: what the entry holds.
const cancelRows = (
  entry: StockHistoryEntry,
  type: MovementType,
): ConfirmRow[] => {
  const names = entryItemNames(entry);
  const figures = entryFigures(entry, type);
  if (type === 'customer_return') {
    const codes = Array.from(
      new Set(Object.keys(figures).map(k => k.split('|')[0])),
    );
    return codes.map(code => ({
      key: code,
      name: names[code] ?? code,
      figures: [
        {label: 'Can sell', value: figures[condKey(code, 'resaleable')] ?? 0},
        {
          label: "Can't sell",
          value: figures[condKey(code, 'not_resaleable')] ?? 0,
        },
      ],
    }));
  }
  return Object.entries(figures).map(([code, qty]) => ({
    key: code,
    name: names[code] ?? code,
    figures: [{value: qty}],
  }));
};

type CancelResult = {ok: true; message: string} | {ok: false; message: string};

// Cancel Entry, from History or from the correction form: returns the
// confirm sheet's spec. `onResult` closes the sheet and reports back.
export const useCancelStockEntry = () => {
  const [cancelReceived] = useCancelStockReceivedMutation();
  const [cancelReturn] = useCancelStockReturnMutation();
  const [cancelCustomer] = useCancelCustomerReturnMutation();

  const run = async (
    entry: StockHistoryEntry,
    type: MovementType,
  ): Promise<CancelResult> => {
    const cancel =
      type === 'return'
        ? cancelReturn
        : type === 'customer_return'
        ? cancelCustomer
        : cancelReceived;
    const noun = NOUN_FOR_TYPE[type];
    try {
      const response: any = await cancel({name: entry.name}).unwrap();
      const result = response?.message;
      if (!result?.success) {
        return {
          ok: false,
          message:
            getSafeServerMessage(result?.message) ??
            `Could not cancel the ${noun}.`,
        };
      }
      return {
        ok: true,
        message:
          getSafeServerMessage(result.message) ?? `Cancelled the ${noun}.`,
      };
    } catch (error: any) {
      return {
        ok: false,
        message: getUserFacingError(error, `Could not cancel the ${noun}.`),
      };
    }
  };

  return (
    entry: StockHistoryEntry,
    type: MovementType,
    onResult: (result: CancelResult) => void,
  ): ConfirmSpec => {
    const rows = cancelRows(entry, type);
    const pieces = rows.reduce(
      (sum, row) =>
        sum + row.figures.reduce((s, f) => s + Number(f.value || 0), 0),
      0,
    );
    return {
      title: `Cancel this ${NOUN_FOR_TYPE[type]}?`,
      header: confirmHeader(
        `${ACTION_FOR_TYPE[type]} · Cancel`,
        entry.store_name || entry.store,
        entry.posting_date,
      ),
      subheader: `Entry of ${entryWhen(entry)}`,
      rows,
      totals: [`${rows.length} item(s) · ${pieces} pcs`],
      reason: entry.reason ?? undefined,
      remarks: entry.remarks ?? undefined,
      note:
        type === 'return'
          ? "The pieces will be put back into the store's stock."
          : "The pieces will be taken out of the store's stock.",
      editLabel: 'Keep entry',
      confirmLabel: 'Yes, cancel',
      destructive: true,
      onConfirm: async () => onResult(await run(entry, type)),
    };
  };
};
