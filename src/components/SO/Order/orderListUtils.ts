// Shared helpers for the SO / PO / DDN list cards.

/** "4 items · 25 pcs". Older servers send no total_qty, so it is left out then. */
export const formatItemsLine = (itemCount?: number, totalQty?: number) => {
  const count = itemCount ?? 0;
  const items = `${count} ${count === 1 ? 'item' : 'items'}`;
  return totalQty == null ? items : `${items} · ${formatQty(totalQty)} pcs`;
};

/** Quantities can be fractional (UOM conversions); show at most 2 decimals. */
export const formatQty = (qty?: number | null) =>
  Number(qty ?? 0).toLocaleString('en-IN', {maximumFractionDigits: 2});
