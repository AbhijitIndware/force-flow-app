import {RosterDay} from '../../../types/baseType';
import moment from 'moment';

export const rosterColors = {
  background: '#F8F8F8',
  card: '#FFFFFF',
  border: '#E5E7EB',
  primary: '#2563EB',
  secondaryText: '#6B7280',
  titleText: '#111827',
  tabActiveBg: '#E8F1FF',
  tabInactiveBg: '#FFFFFF',
  cancelledBg: '#F3F4F6',
  cancelledText: '#9CA3AF',
  splitAccent: '#F59E0B',
};

export const getDayStatus = (
  day: RosterDay,
): 'cancelled' | 'completed' | 'future' => {
  const cancelled = (day.slots ?? []).some(
    slot => slot.status?.toLowerCase() === 'cancelled',
  );
  if (cancelled) {
    return 'cancelled';
  }
  if (moment(day.date).isBefore(moment(), 'day')) {
    return 'completed';
  }
  return 'future';
};

const shiftLabelPriority = ['aon', 'regular'];

export const getRightLabel = (day: RosterDay): string => {
  if (day.is_split) {
    return 'Split';
  }
  const rawLabel = day.shift_label?.trim();
  if (
    rawLabel &&
    shiftLabelPriority.includes(rawLabel.toLowerCase())
  ) {
    return rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase();
  }
  const firstSlot = day.slots?.[0];
  if (firstSlot?.shift_type) {
    const parts = firstSlot.shift_type.trim().split(/\s+/);
    return parts[parts.length - 1];
  }
  return rawLabel || 'Shift';
};

export const formatShiftTime = (t: string): string => {
  if (!t) {
    return '--';
  }
  const m = moment(t, ['HH:mm:ss', 'H:mm:ss']);
  return m.isValid() ? m.format('h:mm a') : t;
};

export const formatDayDate = (date: string): string =>
  moment(date).format('ddd DD MMM');
