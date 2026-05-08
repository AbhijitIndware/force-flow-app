import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '../../../utils/colors';
import { Size } from '../../../utils/fontSize';
import { Fonts } from '../../../constants';
import { CirclePlus, Upload } from 'lucide-react-native';
import moment from 'moment';
import AddExpenseModal from './add-expense-modal';
import Toast from 'react-native-toast-message';
import {
  useCreateExpenseDraftMutation,
  useAddExpenseRowMutation,
  useSubmitExpenseClaimMutation,
} from '../../../features/tada/tadaApiv2';
import { fileToBase64 } from '../../../utils/fileUtils';
import { ExpenseClaimPayload } from '../../../types/baseType';
import { useAppSelector } from '../../../store/hook';
import { useGetDailyPjpListQuery } from '../../../features/base/base-api';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import { pick } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import { windowWidth } from '../../../utils/utils';

type LocalExpenseItem = {
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
};

const AddExpenseComponent = ({ navigation }: any) => {
  const [total, setTotal] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState<LocalExpenseItem[]>([]);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<any | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [pjpStoreId, setPjpStoreId] = useState<string>('');

  const [createExpenseDraft, { isLoading: isCreatingDraft }] =
    useCreateExpenseDraftMutation();
  const [addExpenseRow, { isLoading: isAddingRow }] = useAddExpenseRowMutation();
  const [submitExpenseClaim, { isLoading: isSubmitting }] =
    useSubmitExpenseClaimMutation();

  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );
  const handleSaveExpenseToServer = async () => {
    if (expenses.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please add at least one expense item',
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Create Draft
      setUploadStep('Initializing draft...');
      const pjpId = pjpStoreId;

      if (!pjpId) {
        Toast.show({
          type: 'error',
          text1: 'Please select a PJP',
        });
        setLoading(false);
        return;
      }

      const draftRes = await createExpenseDraft({
        pjp_store_id: pjpId,
      }).unwrap();
      console.log("🚀 ~ handleSaveExpenseToServer ~ draftRes:", draftRes)

      const claim_id = draftRes.message.data?.claim_id;

      if (!claim_id) {
        throw new Error('Failed to obtain claim ID from server');
      }

      // 2. Add Rows Sequentially
      for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        setUploadStep(`Uploading item ${i + 1} of ${expenses.length}...`);

        let imageData = undefined;

        if (expense.attachment) {
          const base64 = await fileToBase64(
            expense.attachment.uri,
            expense.attachment.type,
          );
          imageData = {
            mime: expense.attachment.type,
            data: base64,
          };
        }

        await addExpenseRow({
          claim_id,
          expense_type: expense.expense_type as any,
          amount: expense.amount,
          date: expense.expense_date,
          description: expense.custom_claim_description,
          image: imageData,
          ta_mode: expense.ta_mode as any,
          ta_rail_class: expense.ta_rail_class as any,
          is_local: expense.is_local as any,
          telecom_bill_month: expense.telecom_bill_month,
          mobile_number: expense.mobile_number,
        }).unwrap();
      }

      // 3. Submit Claim
      setUploadStep('Finalizing submission...');
      await submitExpenseClaim({ claim_id }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Expense claim submitted successfully',
        position: 'top',
      });

      clearFormData();
      navigation.goBack();
    } catch (error: any) {
      console.error('Expense Submission Error:', error);
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

  const handleAddLocalExpense = async (item: LocalExpenseItem) => {
    setExpenses(prev => [...prev, item]);
    setTotal(prev => prev + item.amount);
  };

  const clearFormData = () => {
    setExpenses([]);
    setTotal(0);
    setPjpStoreId('');
  };

  const handleRemoveItem = (index: number) => {
    const item = expenses[index];
    setExpenses(prev => prev.filter((_, i) => i !== index));
    setTotal(prev => prev - item.amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Expense Approver</Text>

        <View style={styles.readonlyInput}>
          <Text style={styles.readonlyText}>
            {user?.full_name || 'No Employee Found'}
          </Text>
        </View>
      </View>

      <PjpSelectionDropdown
        value={pjpStoreId}
        onSelect={setPjpStoreId}
      />
      <View style={styles.HeadingHead}>
        <Text style={styles.SectionHeading}>Expense</Text>

        <TouchableOpacity
          disabled={loading}
          onPress={() => setShowModal(true)}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: Size.sm, fontFamily: Fonts.medium }}>
              ₹ {total}
            </Text>
            <CirclePlus size={20} color={Colors.black} />
          </View>
        </TouchableOpacity>
      </View>

      <AddExpenseModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAddExpense={handleAddLocalExpense}
      />

      <Animated.ScrollView contentContainerStyle={styles.dataBoxSection}>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            {/* <Image
              source={require('../../../assets/images/emptyState.png')}
              style={styles.emptyImage}
            /> */}
            <Text style={styles.emptyTitle}>No Items Added</Text>
            <Text style={styles.emptySubtitle}>
              Select a PJP store and tap the '+' icon to add your expenses.
            </Text>
          </View>
        ) : (
          expenses.map((expense, index) => (
            <View key={index} style={styles.dataBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.quantityCount}>{expense.expense_type}</Text>
                <Text style={styles.quantitytime}>
                  {moment(expense.expense_date).format('LL')}
                </Text>
                {expense.attachment && (
                  <View style={styles.attachmentPreview}>
                    <Upload size={12} color={Colors.gray} />
                    <Text style={styles.attachmentText} numberOfLines={1}>
                      {expense.attachment.name}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <Text style={styles.incressValu}>₹ {expense.amount}</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </Animated.ScrollView>

      <TouchableOpacity
        style={[
          styles.submitBtn,
          (loading || expenses.length === 0 || !pjpStoreId) && { opacity: 0.6 }
        ]}
        onPress={() => handleSaveExpenseToServer()}
        disabled={loading || expenses.length === 0 || !pjpStoreId}>
        <Text style={styles.submitText}>Submit Claim</Text>
      </TouchableOpacity>

      {/* ── Progress Overlay ── */}
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={Colors.orange} />
            <Text style={styles.overlayTitle}>Submitting Claim</Text>
            <Text style={styles.overlaySubtitle}>{uploadStep}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const PjpSelectionDropdown = ({ value, onSelect, error }: any) => {
  const { data } = useGetDailyPjpListQuery({
    page: 1,
    page_size: 20,
    status: 'All',
    date: moment().format('YYYY-MM-DD'),
  });
  console.log("🚀 ~ PjpSelectionDropdown ~ data:", data)

  const pjpOptions = (data?.message?.data?.pjp_daily_stores || []).map((item) => ({
    label: `${item.date} (${item.pjp_daily_store_id})`,
    value: item.pjp_daily_store_id,
  }));

  return (
    <View style={{ marginBottom: 15 }}>
      <ReusableDropdown
        label="Select PJP Store"
        field="value"
        value={value}
        data={pjpOptions}
        onChange={onSelect}
        error={error}
      />
    </View>
  );
};

export default AddExpenseComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
    marginBottom: 6,
    color: Colors.darkButton,
  },

  readonlyInput: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border || '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
  },

  readonlyText: {
    fontSize: Size.sm,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  HeadingHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  dataBoxSection: { paddingTop: 15 },
  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityCount: {
    fontFamily: Fonts.medium,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  quantitytime: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  incressValu: {
    color: Colors.sucess,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
    backgroundColor: '#F0F2F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  attachmentText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.gray,
    maxWidth: 120,
  },
  deleteText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.error,
  },
  submitBtn: {
    backgroundColor: Colors.darkButton,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitText: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCard: {
    width: '80%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    gap: 15,
  },
  overlayTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  overlaySubtitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.gray,
    textAlign: 'center',
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  uploadBox: {
    marginTop: 5,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  uploadHint: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },

  previewContainer: {
    marginTop: 12,
    alignItems: 'center',
  },

  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fullWidthImage: {
    width: windowWidth * 0.7,
    height: 200, // adjust if needed
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: '#f9f9f9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },

  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E11D48', // PDF red
    justifyContent: 'center',
    alignItems: 'center',
  },

  fileIcon: {
    fontSize: 22,
    color: '#fff',
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },

  fileType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // submitBtn: {
  //   backgroundColor: Colors.primary,
  //   paddingVertical: 12,
  //   borderRadius: 8,
  //   alignItems: 'center',
  //   marginVertical: 6,
  //   // marginHorizontal: 16,
  // },
  // submitText: {
  //   color: Colors.white,
  //   fontSize: 16,
  //   fontWeight: 'bold',
  // },
});
