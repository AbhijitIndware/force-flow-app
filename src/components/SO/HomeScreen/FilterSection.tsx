import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react-native';
import moment from 'moment';
import { C } from './Common';

interface FilterSectionProps {
  filterMode: 'month' | 'month_range' | 'date_range';
  setFilterMode: (mode: 'month' | 'month_range' | 'date_range') => void;
  selectedMonth: number;
  selectedYear: number;
  fromMonth: number;
  toMonth: number;
  startDate: Date;
  endDate: Date;
  setMonthPickerTarget: (target: 'single' | 'from' | 'to') => void;
  setShowMonthModal: (show: boolean) => void;
  setShowYearModal: (show: boolean) => void;
  setPickingType: (type: 'start' | 'end') => void;
  setShowDatePicker: (show: boolean) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filterMode,
  setFilterMode,
  selectedMonth,
  selectedYear,
  fromMonth,
  toMonth,
  startDate,
  endDate,
  setMonthPickerTarget,
  setShowMonthModal,
  setShowYearModal,
  setPickingType,
  setShowDatePicker,
}) => {
  return (
    <View style={styles.filterSection}>
      <View style={styles.filterTabRow}>
        {[
          { label: 'Monthly', mode: 'month' },
          { label: 'Range', mode: 'date_range' },
        ].map(opt => (
          <TouchableOpacity
            key={opt.mode}
            onPress={() => setFilterMode(opt.mode as any)}
            style={[
              styles.filterChip,
              filterMode === opt.mode && styles.filterChipActive,
            ]}>
            <Text
              style={[
                styles.filterChipText,
                filterMode === opt.mode && styles.filterChipTextActive,
              ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterPickerRow}>
        {filterMode === 'month' && (
          <TouchableOpacity
            style={styles.filterValueBtn}
            onPress={() => {
              setMonthPickerTarget('single');
              setShowMonthModal(true);
            }}>
            <Calendar size={14} color={C.accent} />
            <Text style={styles.filterValueText}>
              {moment()
                .month(selectedMonth - 1)
                .format('MMMM')}
              , {selectedYear}
            </Text>
            <ChevronDown size={14} color={C.textMuted} />
          </TouchableOpacity>
        )}
        {filterMode === 'month_range' && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.filterLabelSmall}>From:</Text>
            <TouchableOpacity
              style={styles.filterValueBtnSmall}
              onPress={() => {
                setMonthPickerTarget('from');
                setShowMonthModal(true);
              }}>
              <Text style={styles.filterValueTextSmall}>
                {moment()
                  .month(fromMonth - 1)
                  .format('MMM')}
              </Text>
            </TouchableOpacity>

            <Text style={styles.filterLabelSmall}>To:</Text>
            <TouchableOpacity
              style={styles.filterValueBtnSmall}
              onPress={() => {
                setMonthPickerTarget('to');
                setShowMonthModal(true);
              }}>
              <Text style={styles.filterValueTextSmall}>
                {moment()
                  .month(toMonth - 1)
                  .format('MMM')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterValueBtnSmall}
              onPress={() => setShowYearModal(true)}>
              <Text style={styles.filterValueTextSmall}>
                {selectedYear}
              </Text>
              <ChevronDown size={10} color={C.textMuted} />
            </TouchableOpacity>
          </View>
        )}
        {filterMode === 'date_range' && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              style={styles.filterDateBtn}
              onPress={() => {
                setPickingType('start');
                setShowDatePicker(true);
              }}>
              <Text style={styles.filterDateLabel}>From</Text>
              <Text style={styles.filterDateVal}>
                {moment(startDate).format('DD MMM')}
              </Text>
            </TouchableOpacity>
            <ChevronRight size={14} color={C.textMuted} />
            <TouchableOpacity
              style={styles.filterDateBtn}
              onPress={() => {
                setPickingType('end');
                setShowDatePicker(true);
              }}>
              <Text style={styles.filterDateLabel}>To</Text>
              <Text style={styles.filterDateVal}>
                {moment(endDate).format('DD MMM')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 12,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  filterTabRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.background,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accent,
  },
  filterChipText: { fontSize: 12, color: '#000', fontWeight: '500' },
  filterChipTextActive: { color: C.accent, fontWeight: '700' },

  filterPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  filterValueBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterValueText: { fontSize: 14, fontWeight: '600', color: C.text },
  filterLabelSmall: { fontSize: 12, color: C.textMuted },
  filterDateVal: { fontSize: 14, fontWeight: '700', color: C.accent },
  filterDateBtn: { alignItems: 'center' },
  filterDateLabel: {
    fontSize: 9,
    color: C.textMuted,
    textTransform: 'uppercase',
  },

  filterValueBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: C.border,
    gap: 4,
  },
  filterValueTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: C.accent,
  },
});
