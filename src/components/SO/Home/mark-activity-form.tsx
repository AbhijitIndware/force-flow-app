import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';

interface FormValues {
  store: string;
  activity_type: {activity_type: string}[];
}

interface Props {
  values: FormValues;
  errors: Partial<Record<keyof FormValues, any>>;
  touched: Partial<Record<keyof FormValues, any>>;
  handleBlur: {
    (e: React.FocusEvent<any, Element>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T_1 = string | React.ChangeEvent<any>>(
      field: T_1,
    ): T_1 extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
  activityList: {label: string; value: string}[];
}
const MarkActivityForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
  activityList,
}) => {
  const isSingleActivity = activityList.length === 1;
  return (
    <Animated.ScrollView
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{padding: 16}}>
      {values.activity_type.map((item, index) => (
        <View key={index} style={{marginBottom: 12, position: 'relative'}}>
          <ReusableDropdown
            label={`Activity Type ${index + 1}`}
            field={`activity_type[${index}].activity_type`}
            value={item.activity_type}
            data={activityList}
            error={
              touched.activity_type?.[index]?.activity_type &&
              errors.activity_type?.[index]?.activity_type
            }
            onChange={(val: string) => {
              const updated = [...values.activity_type];
              updated[index].activity_type = val;
              setFieldValue('activity_type', updated);
            }}
          />

          {values.activity_type.length > 1 && index !== 0 && (
            <TouchableOpacity
              onPress={() => {
                const updated = [...values.activity_type];
                updated.splice(index, 1);
                setFieldValue('activity_type', updated);
              }}
              style={[
                styles.removeButton,
                {position: 'absolute', right: 0, top: 78},
              ]}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity
        disabled={isSingleActivity}
        onPress={() =>
          setFieldValue('activity_type', [
            ...values.activity_type,
            {activity_type: ''},
          ])
        }
        style={[
          styles.addMoreBtn,
          {
            marginBottom: 16,
            alignSelf: 'flex-start',
            opacity: isSingleActivity ? 0.8 : 1, // visually show disabled
          },
        ]}>
        <Text
          style={[
            styles.addMoreText,
            {color: isSingleActivity ? 'gray' : Colors.white},
          ]}>
          + Add Activity
        </Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );
};

export default MarkActivityForm;

const styles = StyleSheet.create({
  addMoreBtn: {
    backgroundColor: Colors.Orangelight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 12,
    width: 'auto',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  addMoreText: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
  },
  removeButton: {
    marginTop: 0,
    padding: 5,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.denger,
    width: 100,
    // height: 40,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
