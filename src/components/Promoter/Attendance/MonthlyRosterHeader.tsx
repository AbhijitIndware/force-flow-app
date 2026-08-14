
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {ChevronDown, ChevronLeft, ChevronRight, X} from 'lucide-react-native';
import moment from 'moment';
import {Fonts} from '../../../constants';
import {rosterColors} from './rosterTheme';

interface MonthlyRosterHeaderProps {
  viewMonth: moment.Moment;
  onMonthChange: (m: moment.Moment) => void;
  regularCount: number;
  aonCount: number;
}

const MONTHS = moment.monthsShort();

const MonthlyRosterHeader = ({
  viewMonth,
  onMonthChange,
  regularCount,
  aonCount,
}: MonthlyRosterHeaderProps) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <View style={styles.wrapper}>
      {/* ── Month Selector + Value Chips ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.monthPill}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.monthPillText}>
            {viewMonth.format('MMM YYYY')}
          </Text>
          <ChevronDown size={14} color={rosterColors.secondaryText} />
        </TouchableOpacity>

        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Regular {regularCount} days</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>AON {aonCount} days</Text>
          </View>
        </View>
      </View>

      {/* ── Month Picker Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={18} color={rosterColors.titleText} />
              </TouchableOpacity>
            </View>

            <View style={styles.yearRow}>
              <TouchableOpacity
                onPress={() =>
                  onMonthChange(viewMonth.clone().subtract(1, 'year'))
                }
                style={styles.yearBtn}>
                <ChevronLeft size={16} color={rosterColors.titleText} />
              </TouchableOpacity>
              <Text style={styles.yearText}>{viewMonth.year()}</Text>
              <TouchableOpacity
                onPress={() =>
                  onMonthChange(viewMonth.clone().add(1, 'year'))
                }
                style={styles.yearBtn}>
                <ChevronRight size={16} color={rosterColors.titleText} />
              </TouchableOpacity>
            </View>

            <View style={styles.monthGrid}>
              {MONTHS.map((month, index) => {
                const selected =
                  viewMonth.year() === moment().year() &&
                  viewMonth.month() === index;
                const isCurrent =
                  moment().year() === viewMonth.year() &&
                  moment().month() === index;
                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthItem,
                      selected && styles.monthItemActive,
                    ]}
                    onPress={() => {
                      onMonthChange(
                        moment()
                          .year(viewMonth.year())
                          .month(index)
                          .startOf('month'),
                      );
                      setModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.monthItemText,
                        selected && styles.monthItemTextActive,
                      ]}>
                      {month}
                    </Text>
                    {isCurrent && <View style={styles.currentDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MonthlyRosterHeader;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: rosterColors.card,
    borderWidth: 1,
    borderColor: rosterColors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  monthPillText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: rosterColors.titleText,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: rosterColors.tabActiveBg,
    borderWidth: 1,
    borderColor: rosterColors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: rosterColors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: rosterColors.card,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: rosterColors.titleText,
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  yearBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: rosterColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: rosterColors.titleText,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  monthItem: {
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: rosterColors.background,
  },
  monthItemActive: {
    backgroundColor: rosterColors.primary,
  },
  monthItemText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: rosterColors.titleText,
  },
  monthItemTextActive: {
    color: rosterColors.card,
  },
  currentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: rosterColors.primary,
    marginTop: 3,
  },
});
