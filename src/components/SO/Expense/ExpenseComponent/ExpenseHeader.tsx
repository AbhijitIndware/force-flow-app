import React from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import {Fonts} from '../../../../constants';
import {Colors} from '../../../../utils/colors';
import {Size} from '../../../../utils/fontSize';
import ReusableDropdownv2 from '../../../ui-lib/resusable-dropdown-v2';

const {width} = Dimensions.get('window');

const MONTHS = moment.months().map((label, i) => ({
  label,
  short: moment().month(i).format('MMM'),
  value: i + 1,
}));
const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = Array.from({length: 5}, (_, i) => CURRENT_YEAR - i);

interface ConsumedData {
  DA?: number;
  TA?: number;
  Lodging?: number;
  Telecom?: number;
  Incidental?: number;
}

interface Props {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  totalConsumed: number;
  consumed: ConsumedData;
  counts: {pending: number; approved: number; rejected: number};
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const BREAKDOWN_ITEMS: {
  key: keyof ConsumedData;
  label: string;
  color: string;
}[] = [
  {key: 'DA', label: 'DA', color: '#F97316'},
  {key: 'TA', label: 'TA', color: '#3B82F6'},
  {key: 'Lodging', label: 'Lodge', color: '#8B5CF6'},
  {key: 'Telecom', label: 'Mob', color: '#10B981'},
  {key: 'Incidental', label: 'Misc', color: '#EC4899'},
];

const formatAmount = (val: number) => {
  if (val === 0) return '₹0';
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${val}`;
};

const ExpenseHeader: React.FC<Props> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  totalConsumed,
  consumed,
  counts,
  selectedStatus,
  onStatusChange,
}) => {
  const [showMonthModal, setShowMonthModal] = React.useState(false);
  const [showYearModal, setShowYearModal] = React.useState(false);

  const selectedMonthLabel =
    MONTHS.find(m => m.value === selectedMonth)?.label || '';

  return (
    <>
      <View style={styles.header}>
        {/* ── Row 1: Filters (Year | Month | Status) ── */}
        <View style={styles.row1}>
          {/* <View style={styles.filterRow}> */}
          <TouchableOpacity
            style={styles.pill}
            onPress={() => setShowYearModal(true)}
            activeOpacity={0.7}>
            <Text style={styles.pillText}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={11} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, styles.pillActive]}
            onPress={() => setShowMonthModal(true)}
            activeOpacity={0.7}>
            <Text style={[styles.pillText, styles.pillTextActive]}>
              {selectedMonthLabel}
            </Text>
            <Ionicons name="chevron-down" size={11} color={Colors.orange} />
          </TouchableOpacity>
          {/* </View> */}

          <View style={styles.statusDropdownWrap}>
            <ReusableDropdownv2
              label="Status"
              field="status"
              value={selectedStatus}
              data={[
                {label: 'All', value: ''},
                {label: 'Draft', value: 'Draft'},
                {label: 'Pending Approval', value: 'Pending Approval'},
                {label: 'Approved', value: 'Approved'},
                {label: 'Rejected', value: 'Rejected'},
                {label: 'Cancelled', value: 'Cancelled'},
                {label: 'HR Pending', value: 'HR Pending'},
                {label: 'HR Approved', value: 'HR Approved'},
                {label: 'HR Rejected', value: 'HR Rejected'},
              ]}
              onChange={(val: string) => onStatusChange(val)}
              height={32}
              marginBottom={0}
              textSize={12}
              labelStyle={{display: 'none'}}
            />
          </View>
        </View>

        {/* ── Row 2: Stats (Pending | Approved | Rejected | Total) ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{counts.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{counts.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
          <View style={[styles.vDivider, {height: 30}]} />
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Total Consumed</Text>
            <Text style={styles.totalAmount}>
              ₹{totalConsumed.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* ── Row 3: Breakdown ── */}
        <View style={styles.row2}>
          {BREAKDOWN_ITEMS.map((item, i) => (
            <React.Fragment key={item.key}>
              <View style={styles.breakdownItem}>
                {/* <View style={[styles.dot, { backgroundColor: item.color }]} /> */}
                <Text style={styles.breakdownAmount}>
                  {formatAmount(consumed[item.key] || 0)}
                </Text>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
              </View>
              {i < BREAKDOWN_ITEMS.length - 1 && (
                <View style={styles.vDivider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Month Modal */}
      <Modal
        visible={showMonthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthModal(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowMonthModal(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Month</Text>
              <TouchableOpacity
                onPress={() => setShowMonthModal(false)}
                style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.grid}>
              {MONTHS.map(m => {
                const active = selectedMonth === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.gridItem, active && styles.gridItemActive]}
                    onPress={() => {
                      onMonthChange(m.value);
                      setShowMonthModal(false);
                    }}>
                    <Text
                      style={[
                        styles.gridText,
                        active && styles.gridTextActive,
                      ]}>
                      {m.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Modal */}
      <Modal
        visible={showYearModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowYearModal(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowYearModal(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Year</Text>
              <TouchableOpacity
                onPress={() => setShowYearModal(false)}
                style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.grid}>
              {YEARS.map(y => {
                const active = selectedYear === y;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[styles.gridItem, active && styles.gridItemActive]}
                    onPress={() => {
                      onYearChange(y);
                      setShowYearModal(false);
                    }}>
                    <Text
                      style={[
                        styles.gridText,
                        active && styles.gridTextActive,
                      ]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default ExpenseHeader;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },

  // ── Row 1 ──
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  pill: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  pillText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#475569',
  },
  pillTextActive: {
    color: Colors.orange,
  },
  statusDropdownWrap: {
    flex: 1,
    maxWidth: 160,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  vDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  statCount: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  totalBlock: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
  },
  statusRow: {
    marginTop: 4,
    width: '100%',
  },

  // ── Row 2 ──
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  breakdownAmount: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: '#0F172A',
  },
  breakdownLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },

  // ── Modals ──
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: (width - 40 - 24) / 4,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridItemActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  gridText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: '#475569',
  },
  gridTextActive: {
    color: '#FFFFFF',
  },
});
