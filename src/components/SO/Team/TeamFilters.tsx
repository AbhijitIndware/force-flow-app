import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';

// ─── Tones used by the website's KPI cards and badge columns ─────────────────
export const TONES: Record<string, { bg: string; color: string }> = {
  green: { bg: '#E7F8EA', color: '#15803D' },
  red: { bg: '#FBE8E8', color: '#B91C1C' },
  blue: { bg: '#E3ECFF', color: '#2563EB' },
  orange: { bg: '#FFF1E0', color: '#C2410C' },
  amber: { bg: '#FFF7ED', color: '#B45309' },
  yellow: { bg: '#FEF9C3', color: '#A16207' },
  purple: { bg: '#EDE7FE', color: '#7C3AED' },
  gray: { bg: '#F0F0F0', color: '#555555' },
};

export const getTone = (tone?: string) =>
  (tone && TONES[tone.toLowerCase()]) || TONES.gray;

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Horizontal chip tabs ─────────────────────────────────────────────────────
interface ChipOption<T extends string> {
  label: string;
  value: T;
}

export function ChipTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            activeOpacity={0.8}
            onPress={() => onChange(o.value)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Month switcher (‹ October 2026 ›) ───────────────────────────────────────
export const MonthSwitcher = ({
  month,
  onChange,
}: {
  month: moment.Moment;
  onChange: (m: moment.Moment) => void;
}) => {
  const isCurrent = month.isSame(moment(), 'month');
  return (
    <View style={styles.monthRow}>
      <TouchableOpacity
        style={styles.monthBtn}
        onPress={() => onChange(month.clone().subtract(1, 'month'))}>
        <Ionicons name="chevron-back" size={16} color={Colors.darkButton} />
      </TouchableOpacity>
      <Text style={styles.monthText}>{month.format('MMMM YYYY')}</Text>
      <TouchableOpacity
        style={[styles.monthBtn, isCurrent && styles.monthBtnDisabled]}
        disabled={isCurrent}
        onPress={() => onChange(month.clone().add(1, 'month'))}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isCurrent ? Colors.gray : Colors.darkButton}
        />
      </TouchableOpacity>
    </View>
  );
};

// ─── Filter button + searchable picker (zone / promoter / store) ─────────────
export interface PickerOption {
  label: string;
  value: string;
}

export const FilterPicker = ({
  icon,
  placeholder,
  value,
  options,
  onChange,
}: {
  icon: string;
  placeholder: string;
  value: string;
  options: PickerOption[];
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedLabel = options.find(o => o.value === value)?.label;
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? options.filter(o => o.label.toLowerCase().includes(q))
      : options;
  }, [options, search]);

  const close = () => {
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.filterBox}
        activeOpacity={0.8}
        onPress={() => setOpen(true)}>
        <Ionicons name={icon} size={14} color={Colors.orange} />
        <Text
          style={[styles.filterText, !value && styles.filterPlaceholder]}
          numberOfLines={1}>
          {selectedLabel ?? placeholder}
        </Text>
        {value ? (
          <TouchableOpacity
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={() => onChange('')}>
            <Ionicons name="close" size={14} color={Colors.gray} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-down" size={14} color={Colors.gray} />
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={close}>
                <Ionicons name="close" size={20} color={Colors.darkButton} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color={Colors.gray} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                placeholderTextColor={Colors.gray}
                style={styles.searchInput}
              />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={o => o.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.emptyText}>No matches</Text>}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    onPress={() => {
                      onChange(item.value);
                      close();
                    }}>
                    <Text style={styles.optionText}>{item.label}</Text>
                    {active && (
                      <Ionicons name="checkmark" size={16} color={Colors.orange} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

// ─── Search input with clear button ──────────────────────────────────────────
export const SearchInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <View style={[styles.searchBox, styles.searchBoxInline]}>
    <Ionicons name="search-outline" size={16} color={Colors.gray} />
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={Colors.gray}
      style={styles.searchInput}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChange('')}>
        <Ionicons name="close-circle" size={16} color={Colors.gray} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Progress bar ────────────────────────────────────────────────────────────
export const ProgressBar = ({ pct }: { pct: number }) => {
  const clamped = Math.max(0, Math.min(100, pct || 0));
  const color =
    pct >= 100 ? '#15803D' : pct < 50 ? '#B91C1C' : Colors.orange;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  chipActive: {
    backgroundColor: Colors.darkButton,
    borderColor: Colors.darkButton,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  chipTextActive: { color: Colors.white },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  monthBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightBg,
  },
  monthBtnDisabled: { opacity: 0.5 },
  monthText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  filterBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: 10,
    height: 38,
  },
  filterText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  filterPlaceholder: { color: Colors.gray },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lightBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 8,
  },
  searchBoxInline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: 0,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.darkButton,
    paddingVertical: 0,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionRowActive: { backgroundColor: '#FFF7ED' },
  optionText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.gray,
    paddingVertical: 20,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
});
