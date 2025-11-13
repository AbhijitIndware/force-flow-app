import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Colors} from '../../../../utils/colors';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';
import {
  useCopyPjpToOtherEmpMutation,
  useGetEmployeesToAssignQuery,
} from '../../../../features/base/base-api';
import Toast from 'react-native-toast-message';

interface Props {
  visible: boolean;
  onClose: () => void;
  date: string;
  sourcePjp: string;
}

const AssignEmployeeModal: React.FC<Props> = ({
  visible,
  onClose,
  date,
  sourcePjp,
}) => {
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const {data, isFetching} = useGetEmployeesToAssignQuery();
  const [copyPjpToOtherEmp, {isLoading}] = useCopyPjpToOtherEmpMutation();

  const toggleSelect = (id: string) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(emp => emp !== id) : [...prev, id],
    );
  };

  /** ─── Handle API Submission ─────────────────────────────────── */
  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select at least one employee.',
        position: 'top',
      });
      return;
    }

    try {
      const payload = {
        data: {
          source_pjp: sourcePjp,
          target_employee: selectedEmployees,
          date: date,
        },
      };

      const res = await copyPjpToOtherEmp(payload).unwrap();

      if (res.status === 'success') {
        Toast.show({
          type: 'success',
          text1: `✅ Copied PJP successfully`,
          text2: res.message,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: `❌ ${res.message || 'Failed to copy PJP'}`,
          position: 'top',
        });
      }

      onClose();
      setSelectedEmployees([]);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Failed to copy PJP',
        text2: error?.data?.message || 'Please try again later.',
        position: 'top',
      });
    }
  };

  useEffect(() => {
    if (data) {
      setEmployeeList(data.employees || []);
    }
  }, [data]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select Employees</Text>

          {isFetching ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <FlatList
              data={employeeList}
              keyExtractor={item => item.id}
              renderItem={({item}) => {
                const isSelected = selectedEmployees.includes(item.id);
                return (
                  <TouchableOpacity
                    onPress={() => toggleSelect(item.id)}
                    style={[
                      styles.listItem,
                      isSelected && styles.selectedItem,
                    ]}>
                    <Text
                      style={[
                        styles.listText,
                        isSelected && {color: Colors.white},
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading || isFetching}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              disabled={isLoading || isFetching}
              onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AssignEmployeeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    marginBottom: 12,
    textAlign: 'center',
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: Colors.primary,
  },
  listText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  cancelText: {
    color: Colors.white,
    fontFamily: Fonts.medium,
  },
  submitButton: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  submitText: {
    color: Colors.white,
    fontFamily: Fonts.medium,
  },
});
