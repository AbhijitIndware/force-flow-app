import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../utils/colors';

const ExpenseComponent = ({navigation}:any) => {
  return (
    <View>
      <Text>expense</Text>
<TouchableOpacity
                onPress={() => navigation.navigate('AddExpenseItemScreen')}
                style={[
                  {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                    height: 40,
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    borderColor: Colors.sucess,
                    backgroundColor: '#C8F8D1',
                    borderRadius: 8,
                    width: '100%',
                  },
                ]}>
                <Text>
                  See how your team is doing
                </Text>
                <Ionicons
                  name="chevron-forward-circle-sharp"
                  size={24}
                  color={Colors.sucess}
                />
              </TouchableOpacity>

    </View>
  );
};

export default ExpenseComponent;

const styles = StyleSheet.create({});
