/**
 * dateUtils.ts
 * Centralized date formatting utilities for the Force Flow app.
 * Place this file in: src/utils/dateUtils.ts
 *
 * Requires: npm install moment
 */

import moment from 'moment';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DateInput = Date | string | number;

export type DateFormat =
  | 'short' // e.g. 15/06/2026  (DD/MM/YYYY — Indian standard)
  | 'medium' // e.g. Jun 5, 2026
  | 'long' // e.g. Friday, June 5, 2026
  | 'time' // e.g. 03:45 PM
  | 'datetime' // e.g. Jun 5, 2026  •  03:45 PM
  | 'relative' // e.g. 2 hours ago / just now / in 3 days
  | 'iso' // e.g. 2026-06-05
  | 'monthYear' // e.g. June 2026
  | 'dayMonth'; // e.g. 5 Jun

// ─── Individual Formatters ────────────────────────────────────────────────────

/** 15/06/2026 — DD/MM/YYYY (Indian standard format) */
export const formatShort = (input: DateInput): string =>
  moment(input).format('DD/MM/YYYY');

/** Jun 5, 2026 */
export const formatMedium = (input: DateInput): string =>
  moment(input).format('MMM D, YYYY');

/** Friday, June 5, 2026 */
export const formatLong = (input: DateInput): string =>
  moment(input).format('dddd, MMMM D, YYYY');

/** 03:45 PM */
export const formatTime = (input: DateInput): string =>
  moment(input).format('hh:mm A');

/** Jun 5, 2026  •  03:45 PM */
export const formatDateTime = (input: DateInput): string =>
  `${formatMedium(input)}  •  ${formatTime(input)}`;

/** 2026-06-05 */
export const formatISO = (input: DateInput): string =>
  moment(input).format('YYYY-MM-DD');

/** June 2026 */
export const formatMonthYear = (input: DateInput): string =>
  moment(input).format('MMMM YYYY');

/** 5 Jun */
export const formatDayMonth = (input: DateInput): string =>
  moment(input).format('D MMM');

/**
 * Relative time — e.g. "just now", "2 hours ago", "in 3 days"
 * Uses moment's fromNow() under the hood.
 */
export const formatRelative = (input: DateInput): string =>
  moment(input).fromNow();

// ─── Master Formatter ─────────────────────────────────────────────────────────

/**
 * formatDate — single entry point for the whole app.
 *
 * @example
 * formatDate(new Date(), 'short')      // "15/06/2026"
 * formatDate(new Date(), 'medium')     // "Jun 5, 2026"
 * formatDate('2026-01-15', 'long')     // "Thursday, January 15, 2026"
 * formatDate(timestamp, 'relative')    // "3 hours ago"
 * formatDate(new Date(), 'time')       // "03:45 PM"
 */
export const formatDate = (
  input: DateInput,
  format: DateFormat = 'short',
): string => {
  switch (format) {
    case 'short':
      return formatShort(input);
    case 'medium':
      return formatMedium(input);
    case 'long':
      return formatLong(input);
    case 'time':
      return formatTime(input);
    case 'datetime':
      return formatDateTime(input);
    case 'relative':
      return formatRelative(input);
    case 'iso':
      return formatISO(input);
    case 'monthYear':
      return formatMonthYear(input);
    case 'dayMonth':
      return formatDayMonth(input);
    default:
      return formatShort(input);
  }
};

// ─── Convenience Checks ───────────────────────────────────────────────────────

/** Returns true if the date is today. */
export const isToday = (input: DateInput): boolean =>
  moment(input).isSame(moment(), 'day');

/** Returns true if the date falls in the current week. */
export const isThisWeek = (input: DateInput): boolean =>
  moment(input).isSame(moment(), 'week');

/**
 * Smart display — auto-picks the best format based on recency.
 * Great for feeds, notifications, and chat timestamps.
 *
 * < 1 hour  → "5 minutes ago"
 * today     → "03:45 PM"
 * this week → "Monday  •  03:45 PM"
 * older     → "15/06/2026"
 */
export const formatSmart = (input: DateInput): string => {
  const m = moment(input);
  const diffMins = moment().diff(m, 'minutes');

  if (diffMins < 60) return m.fromNow();
  if (isToday(input)) return m.format('hh:mm A');
  if (isThisWeek(input))
    return `${m.format('dddd')}  •  ${m.format('hh:mm A')}`;
  return formatShort(input);
};
