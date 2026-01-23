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
import React, {useEffect, useState} from 'react';
import {Colors} from '../../../utils/colors';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {CirclePlus, Upload} from 'lucide-react-native';
import moment from 'moment';
import AddExpenseModal from './add-expense-modal';
import Toast from 'react-native-toast-message';
import {
  useCreateExpenseClaimMutation,
  useUploadAttachmentForClaimMutation,
} from '../../../features/tada/tadaApi';
import {ExpenseClaimPayload} from '../../../types/baseType';
import {useAppSelector} from '../../../store/hook';
import {pick} from '@react-native-documents/picker';
import {launchCamera} from 'react-native-image-picker';
import {windowWidth} from '../../../utils/utils';

type LocalExpenseItem = {
  expense_type: string;
  expense_date: string;
  custom_claim_description: string;
  amount: number;
};

const AddExpenseComponent = ({navigation}: any) => {
  const [total, setTotal] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState<LocalExpenseItem[]>([]);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<any | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  const [uploadAttachmentForClaim, {isLoading: isUploading}] =
    useUploadAttachmentForClaimMutation();
  const [createExpenseClaim, {isSuccess, isLoading}] =
    useCreateExpenseClaimMutation();
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );

  const uploadAttachment = async () => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: attachment.uri,
        name: attachment.name,
        type: attachment.type || 'application/octet-stream',
      });

      formData.append('filename', attachment.name);
      formData.append('is_private', '0');
      formData.append('doctype', 'Expense Claim');
      formData.append('docname', claimId as string);

      const res = await uploadAttachmentForClaim(formData).unwrap();

      // Toast.show({
      //   type: 'success',
      //   text1: 'Attachment uploaded successfully',
      // });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.data?.message || 'Attachment upload failed',
      });
    }
  };

  const handleSaveExpenseToServer = async () => {
    try {
      // ---------------------
      // 1️⃣ CREATE CLAIM
      // ---------------------
      const payload: ExpenseClaimPayload = {
        employee: employee?.id as string,
        posting_date: expenses[0].expense_date,
        custom_travel_start_date: expenses[0].expense_date,
        custom_travel_end_date: expenses[0].expense_date,
        expenses: expenses,
      };

      const res = await createExpenseClaim(payload).unwrap();
      const createdId = res?.data?.name;
      setClaimId(createdId);

      // Continue to upload in useEffect
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.data?.message?.message || 'Internal Server Error',
        position: 'top',
      });
    }
  };

  const handleAddLocalExpense = async (item: LocalExpenseItem) => {
    setExpenses(prev => [...prev, item]);
    setTotal(prev => prev + item.amount);
  };

  const isImage = (type?: string) => {
    return !!type && type.startsWith('image/');
  };

  const handlePickDocument = async () => {
    try {
      const doc = await pick({
        allowMultiSelection: false,
      });

      if (!doc || !doc[0]) return;

      const {uri, name, type} = doc[0];

      setAttachment({
        uri,
        name,
        type: type || 'application/octet-stream',
      });
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  const handleOpenCamera = async () => {
    setShowAttachmentOptions(false);

    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
    });

    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];

    setAttachment({
      uri: asset.uri,
      name: asset.fileName || `photo_${moment().format('YYYY-MM-DD')}.jpg`,
      type: asset.type || 'image/jpeg',
    });
  };

  const clearFormData = () => {
    setExpenses([]);
    setTotal(0);
    setAttachment(null);
    setClaimId(null);
  };

  useEffect(() => {
    if (isSuccess && claimId) {
      // Upload attachment if exists
      if (attachment) {
        uploadAttachment().then(() => {
          Toast.show({
            type: 'success',
            text1: 'Expense saved successfully',
            position: 'top',
          });

          // Clear all local data
          clearFormData();
          navigation.goBack();
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Expense saved successfully',
          position: 'top',
        });

        // Clear local data
        clearFormData();
        navigation.goBack();
      }
    }
  }, [isSuccess, claimId]);

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
      <View style={styles.HeadingHead}>
        <Text style={styles.SectionHeading}>Expense</Text>

        <TouchableOpacity
          disabled={isLoading || isUploading}
          onPress={() => setShowModal(true)}>
          <View style={{flexDirection: 'row', gap: 10}}>
            <Text style={{fontSize: Size.sm, fontFamily: Fonts.medium}}>
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
        {expenses.map((expense, index) => (
          <View key={index} style={styles.dataBox}>
            <View>
              <Text style={styles.quantityCount}>{expense.expense_type}</Text>
              <Text style={styles.quantitytime}>
                Date: {moment(expense.expense_date).format('LL')}
              </Text>
            </View>

            <View>
              <Text style={styles.incressValu}>₹ {expense.amount}</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* ----------------------- */}
      {/*  ATTACHMENT UPLOAD BTN */}
      {/* ----------------------- */}
      {expenses.length >= 1 && (
        <View style={{marginVertical: 20}}>
          {/* <Text style={styles.label}>Attachment</Text> */}

          <TouchableOpacity
            onPress={() => setShowAttachmentOptions(true)}
            style={{
              marginTop: 5,
              height: 100,
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: Colors.borderLight,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
            }}>
            <Upload size={28} color={Colors.black} />
            <Text
              style={{color: '#000', textAlign: 'center', fontWeight: '600'}}>
              Upload images or documennts
            </Text>
          </TouchableOpacity>
          <Modal
            visible={showAttachmentOptions}
            transparent
            animationType="slide"
            onRequestClose={() => setShowAttachmentOptions(false)}>
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowAttachmentOptions(false)}
            />

            <View style={styles.bottomSheet}>
              <Pressable
                style={styles.optionBtn}
                onPress={() => {
                  setShowAttachmentOptions(false);
                  handlePickDocument();
                }}>
                <Text style={styles.optionText}>📁 Select from Drive</Text>
              </Pressable>

              <Pressable style={styles.optionBtn} onPress={handleOpenCamera}>
                <Text style={styles.optionText}>📷 Click Photo</Text>
              </Pressable>

              <Pressable
                style={[styles.optionBtn, {borderTopWidth: 1}]}
                onPress={() => setShowAttachmentOptions(false)}>
                <Text style={[styles.optionText, {color: 'red'}]}>Cancel</Text>
              </Pressable>
            </View>
          </Modal>
          {attachment && (
            <View style={[{flexDirection: 'column', gap: 10}]}>
              <View style={styles.previewContainer}>
                {isImage(attachment.type) ? (
                  <Image
                    source={{uri: attachment.uri}}
                    style={[styles.fullWidthImage, {height: 200}]}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.fileCard}>
                    <View style={styles.fileIconContainer}>
                      <Text style={styles.fileIcon}>📄</Text>
                    </View>
                    <View style={styles.fileInfo}>
                      <Text numberOfLines={1} style={styles.fileName}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.fileType}>PDF Document</Text>
                    </View>
                  </View>
                )}
              </View>

              <TouchableOpacity onPress={() => setAttachment(null)}>
                <Text style={{color: 'red', fontSize: 15, fontWeight: '700'}}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <TouchableOpacity
        style={[styles.submitBtn, (isLoading || isUploading) && {opacity: 0.7}]}
        onPress={() => handleSaveExpenseToServer()}
        disabled={isLoading || isUploading}>
        {isLoading || isUploading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </TouchableOpacity>
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
  dataBoxSection: {paddingTop: 15},
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
  uploadBtn: {
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
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
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
    // marginHorizontal: 16,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
