import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Colors} from '../../../utils/colors';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {CirclePlus} from 'lucide-react-native';
import moment from 'moment';
import AddExpenseModal from './add-expense-modal';
import Toast from 'react-native-toast-message';
import {
  useCreateExpenseDraftMutation,
  useAddExpenseRowMutation,
  useSubmitExpenseClaimMutation,
  useDeleteExpenseRowMutation,
  useGetClaimDetailQuery,
} from '../../../features/tada/tadaApiv2';
import {fileToBase64} from '../../../utils/fileUtils';
import {useAppSelector} from '../../../store/hook';
import ReusableDatePicker from '../../ui-lib/reusable-date-picker';
import {Switch} from 'react-native-paper';
import {EmployeeStrip} from './AddExpense/EmployeeStrip';
import {PjpSelectionDropdown} from './AddExpense/PjpSelectionDropdown';
import {DraftStatusBadge} from './AddExpense/DraftStatusBadge';
import {ProgressOverlay} from './AddExpense/ProgressOverlay';
import {ExpenseRowCard} from './AddExpense/ExpenseRowCard';

export type LocalExpenseItem = {
  expense_type: string;
  expense_date: string;
  custom_claim_description: string;
  amount: number;
  attachment?: any;
  ta_mode?: string;
  ta_rail_class?: string;
  is_local?: 0 | 1;
  telecom_bill_month?: string;
  mobile_number?: string;
  ta_km?: number;
  incidental_bill_month?: string;
  row_id?: string;
  is_self_arranged_stay?: number;
};

type Props = {
  navigation: any;
  existingClaimId?: string;
};

const AddExpenseComponent = ({navigation, existingClaimId}: Props) => {
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState<LocalExpenseItem[]>([]);
  const [claimId, setClaimId] = useState<string | null>(
    existingClaimId || null,
  );
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [pjpStoreId, setPjpStoreId] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [isSelfArrangedStay, setIsSelfArrangedStay] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const draftAttempted = useRef(false);

  const [createExpenseDraft] = useCreateExpenseDraftMutation();
  const [addExpenseRow] = useAddExpenseRowMutation();
  const [submitExpenseClaim] = useSubmitExpenseClaimMutation();
  const [deleteExpenseRow] = useDeleteExpenseRowMutation();

  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  // ── Load existing rows when editing a draft ──
  const {data: existingDetail} = useGetClaimDetailQuery(
    {claim_id: existingClaimId!},
    {skip: !existingClaimId},
  );
  console.log(
    '🚀 ~ AddExpenseComponent ~ existingDetail:',
    existingDetail?.message?.data?.distance_km,
  );

  const workflowStatus: string =
    existingDetail?.message?.data?.workflow_state || '';

  const isDraft = workflowStatus === 'Draft' || !workflowStatus;
  const isPendingApproval = workflowStatus === 'Pending Approval';
  const isApproved = workflowStatus === 'Approved';
  const isRejected = workflowStatus === 'Rejected';
  const isReadOnly = isPendingApproval || isApproved || isRejected;

  // ── Derive workflow status from API ──
  useEffect(() => {
    const rows = existingDetail?.message?.data?.expenses;
    setSelectedDate(
      existingDetail?.message?.data?.travel_start_date ||
        moment().format('YYYY-MM-DD'),
    );
    setDistanceKm(existingDetail?.message?.data?.distance_km as number);
    setIsSelfArrangedStay(
      existingDetail?.message?.data?.is_self_arranged_stay === 1,
    );
    if (!rows?.length) return;
    const mapped: LocalExpenseItem[] = rows.map((r: any) => ({
      expense_type: r.expense_type,
      expense_date: r.date,
      custom_claim_description: r.description,
      amount: Number(r.amount),
      ta_mode: r.ta_mode,
      ta_rail_class: r.ta_rail_class,
      is_local: r.is_local,
      telecom_bill_month: r.telecom_bill_month,
      mobile_number: r.mobile_number,
      ta_km: r.ta_km,
      incidental_bill_month: r.incidental_bill_month,
      row_id: r.row_id,
      attachment: r.receipt_url,
    }));
    setExpenses(mapped);
    setTotal(mapped.reduce((s, r) => s + r.amount, 0));
  }, [existingDetail]);

  // ── Step 1: Create Draft ──
  const handleCreateDraft = async () => {
    if (!pjpStoreId) {
      Toast.show({type: 'error', text1: 'Please select a PJP first'});
      return;
    }
    if (claimId) return;
    try {
      setLoading(true);
      setUploadStep('Creating draft...');
      const draftRes = await createExpenseDraft({
        pjp_store_id: pjpStoreId,
        // is_self_arranged_stay: isSelfArrangedStay ? 1 : 0,
      }).unwrap();
      console.log('🚀 ~ handleCreateDraft ~ draftRes:', draftRes);
      const newClaimId = draftRes.message.data?.claim_id;
      const distance = draftRes.message.data?.distance_km;
      if (!newClaimId) throw new Error('Failed to obtain claim ID');
      setClaimId(newClaimId);
      setDistanceKm(distance as number);
      Toast.show({
        type: 'success',
        text1: 'Draft created! Now add your expenses.',
        position: 'top',
      });
    } catch (error: any) {
      draftAttempted.current = false;
      Toast.show({
        type: 'error',
        text1: error?.data?.message?.message || 'Failed to create draft',
        position: 'top',
      });
    } finally {
      setLoading(false);
      setUploadStep('');
    }
  };

  // ── Step 2: Add Row ──
  const handleAddLocalExpense = async (item: LocalExpenseItem) => {
    if (!claimId) {
      Toast.show({type: 'error', text1: 'Please create a draft first.'});
      return;
    }
    try {
      setLoading(true);
      setUploadStep('Adding expense item...');
      let imageData = undefined;
      if (item.attachment) {
        const base64 = await fileToBase64(
          item.attachment.uri,
          item.attachment.type,
        );
        imageData = {mime: item.attachment.type, data: base64};
      }
      const rowRes = await addExpenseRow({
        claim_id: claimId,
        expense_type: item.expense_type as any,
        amount: item.amount,
        date: item.expense_date,
        description: item.custom_claim_description,
        image: imageData,
        ta_rail_class: item.ta_rail_class as any,
        is_local: item.is_local as any,
        telecom_bill_month: item.telecom_bill_month,
        mobile_number: item.mobile_number,
        ta_km: item.ta_km,
        incidental_bill_month: item.incidental_bill_month,
        is_self_arranged_stay: item.is_self_arranged_stay,
      }).unwrap();
      const row_id = rowRes?.message?.data?.row_id;
      setExpenses(prev => [...prev, {...item, row_id}]);
      setTotal(prev => prev + item.amount);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.data?.message?.message || 'Failed to add expense item',
        position: 'top',
      });
    } finally {
      setLoading(false);
      setUploadStep('');
    }
  };

  // ── Remove Row ──
  const handleRemoveItem = async (index: number) => {
    const item = expenses[index];
    if (claimId && item.row_id) {
      try {
        setLoading(true);
        setUploadStep('Removing item...');
        await deleteExpenseRow({
          claim_id: claimId,
          row_id: item.row_id,
        }).unwrap();
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: error?.data?.message?.message || 'Failed to remove item',
          position: 'top',
        });
        return;
      } finally {
        setLoading(false);
        setUploadStep('');
      }
    }
    setExpenses(prev => prev.filter((_, i) => i !== index));
    setTotal(prev => prev - item.amount);
  };

  // ── Step 3: Submit ──
  const handleSubmitClaim = async () => {
    if (expenses.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please add at least one expense item',
      });
      return;
    }
    if (!claimId) {
      Toast.show({type: 'error', text1: 'No active draft found'});
      return;
    }
    try {
      setLoading(true);
      setUploadStep('Finalizing submission...');
      let res = await submitExpenseClaim({claim_id: claimId}).unwrap();
      console.log('🚀 ~ handleSubmitClaim ~ res:', res);
      Toast.show({
        type: 'success',
        text1: 'Expense claim submitted successfully',
        position: 'top',
      });
      clearFormData();
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.data?.message?.message || 'Failed to submit expense',
        position: 'top',
      });
    } finally {
      setLoading(false);
      setUploadStep('');
    }
  };

  const clearFormData = () => {
    setExpenses([]);
    setTotal(0);
    setPjpStoreId('');
    setClaimId(null);
    setDistanceKm(0);
    setIsSelfArrangedStay(false);
    draftAttempted.current = false;
  };

  const handlePjpSelect = (id: string) => {
    if (id !== pjpStoreId) {
      setClaimId(null);
      setExpenses([]);
      setTotal(0);
      draftAttempted.current = false;
    }
    setPjpStoreId(id);
  };

  const isEditMode = !!existingClaimId;
  // ── Status banner config ──
  const STATUS_BANNER: Record<
    string,
    {label: string; bg: string; color: string; dot: string}
  > = {
    Draft: {label: 'Draft', bg: '#f8fafc', color: '#475569', dot: '#94a3b8'},
    'Pending Approval': {
      label: 'Pending Approval',
      bg: '#fffbeb',
      color: '#d97706',
      dot: '#fbbf24',
    },
    Approved: {
      label: 'Approved',
      bg: '#f0fdf4',
      color: '#16a34a',
      dot: '#22c55e',
    },
    Rejected: {
      label: 'Rejected',
      bg: '#fff1f2',
      color: '#dc2626',
      dot: '#f87171',
    },
  };
  const bannerCfg = STATUS_BANNER[workflowStatus] ?? STATUS_BANNER['Draft'];

  return (
    <View style={styles.container}>
      <EmployeeStrip employee={employee} />
      {/* ── Workflow status banner (only when viewing existing) ── */}
      {/* {existingClaimId && workflowStatus ? (
        <View style={[extraStyles.statusBanner, { backgroundColor: bannerCfg.bg }]}>
          <View style={[extraStyles.statusDot, { backgroundColor: bannerCfg.dot }]} />
          <Text style={[extraStyles.statusBannerText, { color: bannerCfg.color }]}>
            {bannerCfg.label}
          </Text>
          {isReadOnly && (
            <Text style={extraStyles.readOnlyHint}>· Read-only</Text>
          )}
        </View>
      ) : null} */}
      {/* ── Date + PJP ── */}
      <View style={styles.rowInputs}>
        <View style={{flex: 1}}>
          <ReusableDatePicker
            label="Date"
            value={selectedDate}
            onChange={(val: string) => setSelectedDate(val)}
            marginBottom={0}
            labelStyle={styles.inputLabel}
            inputStyle={{fontSize: 13}}
            height={42}
            disabled={!!claimId || isReadOnly}
          />
        </View>
        <View style={{flex: 1.3}}>
          <PjpSelectionDropdown
            value={pjpStoreId}
            onSelect={handlePjpSelect}
            selectedDate={selectedDate}
            disabled={!!claimId || isReadOnly}
          />
        </View>
      </View>

      {/* ── Distance KM Display ── */}
      <View style={styles.distanceCard}>
        <View style={styles.distanceContent}>
          <Text style={styles.distanceLabel}>Distance Travelled</Text>
          <Text style={styles.distanceValue}>
            {distanceKm || distanceKm === 0 ? `${distanceKm} km` : 'N/A'}
          </Text>
        </View>
      </View>

      {/* ── Self Arranged Stay (only before draft, not in edit mode) ── */}

      {/* <View
        style={[
          styles.toggleRow,
          claimId && isEditMode && { backgroundColor: '#E2E8F0', opacity: 0.6 },
        ]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>Self Arranged Stay</Text>
          <Text style={styles.toggleSub}>
            {claimId && isEditMode
              ? 'Cannot be changed while updating'
              : 'Enable if you arranged your own lodging'}
          </Text>
        </View>
        <Switch
          value={isSelfArrangedStay}
          disabled={claimId && isEditMode ? true : false || expenses.length > 0}
          trackColor={{ false: '#CBD5E1', true: Colors.primary + '80' }}
          thumbColor={isSelfArrangedStay ? Colors.primary : '#f4f3f4'}
          onValueChange={setIsSelfArrangedStay}
        />
      </View> */}

      {/* ── Draft Status Badge ── */}
      {claimId && (
        <DraftStatusBadge
          claimId={claimId}
          itemCount={expenses.length}
          status={existingDetail?.message?.data?.workflow_state}
        />
      )}

      {/* ── Expense Section Header ── */}
      {claimId && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          {isDraft && (
            <TouchableOpacity
              disabled={loading}
              onPress={() => setShowModal(true)}
              style={styles.addBtn}>
              <Text style={styles.addBtnTotal}>
                ₹ {total.toLocaleString('en-IN')}
              </Text>
              <CirclePlus size={20} color={Colors.darkButton} />
            </TouchableOpacity>
          )}
          {!isDraft && (
            <Text style={styles.addBtnTotal}>
              ₹ {total.toLocaleString('en-IN')}
            </Text>
          )}
        </View>
      )}

      <AddExpenseModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAddExpense={handleAddLocalExpense}
        selectedDate={selectedDate}
      />

      {/* ── Expense List ── */}
      {claimId && (
        <Animated.ScrollView contentContainerStyle={styles.listContent}>
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No items added</Text>
              <Text style={styles.emptySubtitle}>
                Tap the '+' icon above to add your first expense.
              </Text>
            </View>
          ) : (
            expenses.map((expense, index) => (
              <ExpenseRowCard
                key={expense.row_id || index}
                expense={expense}
                loading={loading}
                onRemove={isDraft ? () => handleRemoveItem(index) : undefined}
              />
            ))
          )}
        </Animated.ScrollView>
      )}

      {/* ── Action Button ── */}
      {!claimId ? (
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {backgroundColor: Colors.darkButton},
            (!pjpStoreId || loading) && styles.disabled,
          ]}
          onPress={handleCreateDraft}
          disabled={!pjpStoreId || loading}>
          <Text style={styles.actionBtnText}>Create Draft</Text>
        </TouchableOpacity>
      ) : (
        <>
          {claimId && isDraft ? (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: Colors.darkButton},
                (loading || expenses.length === 0) && styles.disabled,
              ]}
              onPress={handleSubmitClaim}
              disabled={loading || expenses.length === 0}>
              <Text style={styles.actionBtnText}>Submit Claim</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: Colors.darkButton},
                styles.disabled,
              ]}>
              <Text style={styles.actionBtnText}>Submit Claim</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <ProgressOverlay visible={loading} step={uploadStep} />
    </View>
  );
};

export default AddExpenseComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  distanceCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  distanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  distanceLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#64748B',
  },
  distanceValue: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.darkButton,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#666',
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  toggleTitle: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  toggleSub: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.darkButton,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtnTotal: {
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionBtnText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  readOnlyBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  readOnlyBannerApproved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  readOnlyBannerRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  readOnlyText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: '#92400E',
    textAlign: 'center',
  },
  readOnlyTextApproved: {
    color: '#166534',
  },
  readOnlyTextRejected: {
    color: '#991B1B',
  },
});

// ── Additional styles (merge with existing StyleSheet) ──
const extraStyles = StyleSheet.create({
  // Status banner at top
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusBannerText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  readOnlyHint: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94a3b8',
  },

  // Approve / Reject row
  approvalRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dc2626',
  },
  rejectBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#dc2626',
  },
  approveBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#16a34a',
  },
  approveBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#fff',
  },

  // Read-only footer bar
  readOnlyBar: {
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  readOnlyBarText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748b',
  },
});
