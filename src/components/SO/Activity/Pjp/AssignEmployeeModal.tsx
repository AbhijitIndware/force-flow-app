import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Modal, Portal, Button} from 'react-native-paper';
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
          text1: '✅ Copied PJP successfully',
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
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}>
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
                  style={[styles.listItem, isSelected && styles.selectedItem]}>
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
          <Button
            mode="outlined"
            onPress={onClose}
            disabled={isLoading || isFetching}
            style={styles.cancelButton}
            labelStyle={styles.cancelText}>
            Cancel
          </Button>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading || isFetching}
            style={styles.submitButton}
            labelStyle={styles.submitText}>
            Submit
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default AssignEmployeeModal;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    textAlign: 'center',
    marginBottom: 12,
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
    borderColor: Colors.gray,
  },
  cancelText: {
    color: Colors.gray,
    fontFamily: Fonts.medium,
  },
  submitButton: {
    backgroundColor: Colors.success,
  },
  submitText: {
    color: Colors.white,
    fontFamily: Fonts.medium,
  },
});
