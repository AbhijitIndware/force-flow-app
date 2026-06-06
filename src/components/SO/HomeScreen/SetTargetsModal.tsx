import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {Fonts} from '../../../constants';
import {
  useGetTeamEmployeesQuery,
  useGetEmployeeTargetsForEmpQuery,
  useSetEmployeeTargetsForEmpMutation,
  useGetTargetAchievementSummaryQuery,
} from '../../../features/base/base-api';
import MultiSelectDropdown, {
  MultiSelectOption,
} from '../../ui-lib/multiselect-dropdown';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const MODAL_MAX_HEIGHT = SCREEN_HEIGHT * 0.78;
const ALL_EMPLOYEES = 'ALL';

// ─── SummaryMetric sub-component ─────────────────────────────────────────────

interface SummaryMetricProps {
  label: string;
  value: number;
  target: number;
  count: number;
  countLabel: string;
}

const SummaryMetric: React.FC<SummaryMetricProps> = ({
  label,
  value,
  target,
  count,
  countLabel,
}) => {
  const hasTarget = target > 0;
  const hasValue = value > 0;
  const pct = hasTarget ? Math.round((value / target) * 100) : null;

  const formatValue = (v: number) => {
    if (v === 0) return '—';
    if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
    if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}K`;
    return `₹${v.toFixed(0)}`;
  };

  const pctColor =
    pct === null
      ? '#9CA3AF'
      : pct >= 100
      ? '#16A34A'
      : pct >= 70
      ? '#D97706'
      : '#DC2626';

  return (
    <View style={smStyles.container}>
      <Text style={smStyles.label}>{label}</Text>
      <Text style={[smStyles.value, !hasValue && smStyles.valueMuted]}>
        {formatValue(value)}
      </Text>
      {hasTarget ? (
        <>
          <View style={smStyles.barTrack}>
            <View
              style={[
                smStyles.barFill,
                {
                  width: `${Math.min(pct!, 100)}%` as any,
                  backgroundColor: pctColor,
                },
              ]}
            />
          </View>
          <Text style={[smStyles.pct, {color: pctColor}]}>{pct}%</Text>
          <Text style={smStyles.targetLabel}>
            of {formatValue(target)} target
          </Text>
        </>
      ) : (
        <Text style={smStyles.noTarget}>No target set</Text>
      )}
      <View style={smStyles.countPill}>
        <Text style={smStyles.countText}>
          {count > 0 ? `${count} ${countLabel}` : `No ${countLabel}`}
        </Text>
      </View>
    </View>
  );
};

const smStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
  value: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: '#111827',
    marginTop: 2,
  },
  valueMuted: {
    color: '#9CA3AF',
  },
  barTrack: {
    width: '90%',
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 99,
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
  },
  pct: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
  targetLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: Fonts.regular,
  },
  noTarget: {
    fontSize: 11,
    color: '#D1D5DB',
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    marginTop: 4,
  },
  countPill: {
    marginTop: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: Fonts.medium,
  },
});

// ─── SetTargetsModal ──────────────────────────────────────────────────────────

interface SetTargetsModalProps {
  visible: boolean;
  selectedMonth: number;
  selectedYear: number;
  onCancel: () => void;
  onSaveSuccess: (salesTarget: number, ddnTarget: number) => void;
}

export const SetTargetsModal: React.FC<SetTargetsModalProps> = ({
  visible,
  selectedMonth,
  selectedYear,
  onCancel,
  onSaveSuccess,
}) => {
  const [editSalesTarget, setEditSalesTarget] = useState('');
  const [editDdnTarget, setEditDdnTarget] = useState('');
  const [selectedEmployee, setSelectedEmployee] =
    useState<string>(ALL_EMPLOYEES);

  // ── 1. Team list ──────────────────────────────────────────────────────────
  const {data: teamData, isFetching: isLoadingTeam} = useGetTeamEmployeesQuery(
    undefined,
    {skip: !visible},
  );

  const employeeOptions: MultiSelectOption[] = [
    {label: 'All Employees', value: ALL_EMPLOYEES},
    ...(teamData?.message ?? []).map(emp => ({
      label: emp.employee_name,
      value: emp.name,
    })),
  ];

  // ── 2. Existing targets ───────────────────────────────────────────────────
  const {data: employeeTargetsData, isFetching: isLoadingTargets} =
    useGetEmployeeTargetsForEmpQuery(
      {month: selectedMonth, year: selectedYear, employee: selectedEmployee},
      {skip: !visible},
    );

  // ── 3. Achievement summary ────────────────────────────────────────────────
  const fromDate = moment({year: selectedYear, month: selectedMonth - 1})
    .startOf('month')
    .format('YYYY-MM-DD');
  const toDate = moment({year: selectedYear, month: selectedMonth - 1})
    .endOf('month')
    .format('YYYY-MM-DD');

  const {data: summaryData, isFetching: isLoadingSummary} =
    useGetTargetAchievementSummaryQuery(
      {
        from_date: fromDate,
        to_date: toDate,
        ...(selectedEmployee !== ALL_EMPLOYEES
          ? {employee: selectedEmployee}
          : {}),
      },
      {skip: !visible},
    );

  // ── 4. Mutation ───────────────────────────────────────────────────────────
  const [setEmployeeTargetsForEmp, {isLoading: isSavingTargets}] =
    useSetEmployeeTargetsForEmpMutation();

  // ── Populate inputs when target data arrives ──────────────────────────────
  useEffect(() => {
    if (employeeTargetsData?.message) {
      setEditSalesTarget(
        String(employeeTargetsData.message.sales_target ?? ''),
      );
      setEditDdnTarget(String(employeeTargetsData.message.ddn_target ?? ''));
    }
  }, [employeeTargetsData]);

  // ── Reset on close ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      setSelectedEmployee(ALL_EMPLOYEES);
      setEditSalesTarget('');
      setEditDdnTarget('');
    }
  }, [visible]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const salesVal = Number(editSalesTarget);
    const ddnVal = Number(editDdnTarget);

    if (
      isNaN(salesVal) ||
      isNaN(ddnVal) ||
      !editSalesTarget ||
      !editDdnTarget
    ) {
      Toast.show({type: 'error', text1: '❌ Please enter valid numbers'});
      return;
    }

    try {
      const result = await setEmployeeTargetsForEmp({
        sales_target: salesVal,
        ddn_target: ddnVal,
        month: selectedMonth,
        year: selectedYear,
        employee: selectedEmployee,
      }).unwrap();

      const updatedCount =
        'updated' in result.message ? result.message.updated : 1;
      Toast.show({
        type: 'success',
        text1:
          selectedEmployee === ALL_EMPLOYEES
            ? `✅ Targets saved for ${updatedCount} employee${
                updatedCount !== 1 ? 's' : ''
              }`
            : '✅ Targets saved successfully',
      });
      onSaveSuccess(salesVal, ddnVal);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: `❌ ${
          err?.data?.message || err?.message || 'Failed to save targets'
        }`,
      });
    }
  };

  const isLoading = isLoadingTeam || isLoadingTargets;
  const summary = summaryData?.message;
  const targetSource = employeeTargetsData?.message?.source;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}>
      {/* Full-screen dimmed backdrop — tap outside to dismiss */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onCancel}
      />

      {/* KeyboardAvoidingView sits over the backdrop */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kavWrapper}
        pointerEvents="box-none">
        <View style={styles.sheet}>
          {/* ── Drag handle ─────────────────────────────────── */}
          <View style={styles.handle} />

          {/* ── Static header (never scrolls) ───────────────── */}
          <View style={styles.headerBlock}>
            <Text style={styles.modalTitle}>Set Monthly Targets</Text>
            <Text style={styles.periodText}>
              {moment({year: selectedYear, month: selectedMonth - 1}).format(
                'MMMM YYYY',
              )}{' '}
              · targets apply to selected month only
            </Text>
          </View>

          {/* ── Scrollable body ──────────────────────────────── */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="always">
            {/* Employee selector */}
            {isLoadingTeam ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#16A34A" />
                <Text style={styles.loadingText}>Loading team...</Text>
              </View>
            ) : (
              <MultiSelectDropdown
                label="Apply To"
                data={employeeOptions}
                selectedValues={[selectedEmployee]}
                onChange={vals => {
                  const next = vals[vals.length - 1] ?? ALL_EMPLOYEES;
                  setSelectedEmployee(next);
                }}
                placeholder="Select employee..."
                searchPlaceholder="Search by name..."
                height={40}
              />
            )}

            {/* Target inputs */}
            {isLoadingTargets ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#16A34A" />
                <Text style={styles.loadingText}>Loading targets...</Text>
              </View>
            ) : (
              <>
                <View style={styles.inputBlock}>
                  <Text style={styles.modalLabel}>Order Target (₹)</Text>
                  <TextInput
                    value={editSalesTarget}
                    onChangeText={setEditSalesTarget}
                    keyboardType="numeric"
                    placeholder="e.g. 5000000"
                    style={styles.input}
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.modalLabel}>
                    Delivery Note Target (₹)
                  </Text>
                  <TextInput
                    value={editDdnTarget}
                    onChangeText={setEditDdnTarget}
                    keyboardType="numeric"
                    placeholder="e.g. 4000000"
                    style={styles.input}
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="done"
                  />
                </View>
              </>
            )}

            {/* Achievement summary */}
            {!isLoadingSummary && summary && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryTitle}>
                    {moment({
                      year: selectedYear,
                      month: selectedMonth - 1,
                    }).format('MMM YYYY')}{' '}
                    · Achievement
                  </Text>
                  <Text style={styles.summaryScope}>
                    {summary.scope === 'team' ? '👥 Team' : '🌐 Global'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <SummaryMetric
                    label="Orders (SO)"
                    value={summary.so_value}
                    target={summary.sales_target}
                    count={summary.so_count}
                    countLabel="orders"
                  />
                  <View style={styles.divider} />
                  <SummaryMetric
                    label="Deliveries (DDN)"
                    value={summary.ddn_value}
                    target={summary.ddn_target}
                    count={summary.ddn_count}
                    countLabel="notes"
                  />
                </View>
              </View>
            )}

            {/* Bottom padding so last item clears the action bar */}
            <View style={styles.scrollBottomPad} />
          </ScrollView>

          {/* ── Static action bar (never scrolls) ───────────── */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSavingTargets}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (isSavingTargets || isLoading) && styles.confirmButtonDisabled,
              ]}
              disabled={isSavingTargets || isLoading}
              onPress={handleSave}>
              {isSavingTargets ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmText}>
                  {selectedEmployee === ALL_EMPLOYEES ? 'Save for All' : 'Save'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Backdrop is absolutely positioned, fills screen
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  // KAV centres the sheet vertically, pointerEvents="box-none" lets
  // taps on empty space fall through to the backdrop dismissal
  kavWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sheet is a fixed-width card with a capped height — content scrolls inside
  sheet: {
    width: '90%',
    maxHeight: MODAL_MAX_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 10,
    marginBottom: 4,
  },
  headerBlock: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    color: '#111827',
  },
  periodText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: Fonts.regular,
  },
  // scrollBody fills remaining height between header and action bar
  scrollBody: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 14,
  },
  scrollBottomPad: {
    height: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: Fonts.regular,
  },
  sourceBadgeRow: {
    flexDirection: 'row',
    marginTop: -4,
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sourceBadgePersonal: {backgroundColor: '#DCFCE7'},
  sourceBadgeGlobal: {backgroundColor: '#F3F4F6'},
  sourceBadgeText: {fontSize: 11, fontFamily: Fonts.medium},
  sourceBadgeTextPersonal: {color: '#15803D'},
  sourceBadgeTextGlobal: {color: '#6B7280'},
  inputBlock: {
    gap: 4,
  },
  modalLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: Fonts.regular,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  // Summary card
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Fonts.medium,
  },
  summaryScope: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: Fonts.regular,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    alignSelf: 'stretch',
    marginHorizontal: 10,
  },
  // Action bar — pinned to bottom of sheet
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    gap: 10,
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  confirmButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    minWidth: 90,
    alignItems: 'center',
    flex: 1,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  cancelText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
});
