import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import {
  baseApi,
  useGetMyPjpReopenStatusQuery,
  useRequestPjpReopenMutation,
} from '../../../features/base/base-api';
import { useAppDispatch } from '../../../store/hook';
import {
  getSafeServerMessage,
  isServerSuccess,
  getUserFacingError,
} from '../../../utils/errorMessage';

/**
 * Shown under "Your PJP for today is completed" on the home header. Lets an
 * employee who tapped End PJP by mistake ask their manager to reopen today's
 * PJP (works like late check-in approval).
 */
export const PjpReopenBlock: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isFetching } = useGetMyPjpReopenStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const [requestReopen, { isLoading: isSending }] =
    useRequestPjpReopenMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');

  // can_request may sit at the top level or inside data.
  const canRequest = !!(
    data?.message?.can_request ??
    (data?.message?.data as any)?.can_request
  );
  const status = data?.message?.data?.status;
  const managerRemarks = data?.message?.data?.manager_remarks;

  // Approved: the PJP runs again. Refetch the workflow state once so the
  // header switches back to Running / Store Check-In.
  const refreshedForApproval = useRef(false);
  useEffect(() => {
    if (status === 'Approved' && !refreshedForApproval.current) {
      refreshedForApproval.current = true;
      dispatch(baseApi.util.invalidateTags(['PJP']));
    }
  }, [status, dispatch]);

  const closeModal = () => {
    setModalVisible(false);
    setReason('');
  };

  const submit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      Toast.show({ type: 'error', text1: 'Please enter a reason' });
      return;
    }
    try {
      const res = await requestReopen({ reason: trimmed }).unwrap();
      const msg = getSafeServerMessage(res?.message?.message);
      Toast.show({
        type: isServerSuccess(res) ? 'success' : 'error',
        text1:
          msg ??
          (isServerSuccess(res)
            ? 'Reopen request sent'
            : 'Could not send the request'),
      });
      if (isServerSuccess(res)) closeModal();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(err, 'Could not send the request'),
      });
    }
  };

  if (!data && isFetching) {
    return <ActivityIndicator size="small" color={Colors.white} style={styles.loader} />;
  }

  let body: React.ReactNode = null;
  if (status === 'Pending') {
    body = (
      <Text style={styles.infoText}>
        Reopen request sent – waiting for your manager
      </Text>
    );
  } else if (status === 'Approved') {
    body = (
      <Text style={styles.infoText}>
        Reopen approved. Pull down to refresh.
      </Text>
    );
  } else if (status === 'Rejected') {
    body = (
      <View>
        <Text style={styles.infoText}>Reopen request rejected</Text>
        {!!managerRemarks && (
          <Text style={styles.remarksText}>{managerRemarks}</Text>
        )}
      </View>
    );
  }

  return (
    <View>
      {body}
      {canRequest && status !== 'Pending' && (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.requestButtonText}>
            Ended by mistake? Request reopen
          </Text>
          <Ionicons
            name="chevron-forward-circle-sharp"
            size={22}
            color={Colors.white}
          />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request PJP reopen</Text>
            <Text style={styles.modalSubtitle}>
              Your manager will be asked to reopen today's PJP.
            </Text>
            <Text style={styles.label}>
              Reason <Text style={{ color: Colors.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Why did you end the PJP by mistake?"
              placeholderTextColor="#94a3b8"
              value={reason}
              onChangeText={setReason}
              multiline
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={closeModal}
                disabled={isSending}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.sendBtn,
                  (!reason.trim() || isSending) && { opacity: 0.6 },
                ]}
                onPress={submit}
                disabled={!reason.trim() || isSending}>
                {isSending ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.sendText}>Send request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: 8 },
  infoText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  remarksText: {
    color: '#ffeaea',
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    gap: 5,
    marginTop: 10,
  },
  requestButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.white,
    lineHeight: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: Size.md,
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginBottom: 14,
  },
  label: {
    fontSize: Size.xxs,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  actions: { flexDirection: 'row', gap: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: '#f1f5f9' },
  cancelText: {
    fontSize: Size.xxs,
    fontFamily: Fonts.semiBold,
    color: '#475569',
  },
  sendBtn: { backgroundColor: Colors.darkButton },
  sendText: {
    color: Colors.white,
    fontSize: Size.xxs,
    fontFamily: Fonts.semiBold,
  },
});
