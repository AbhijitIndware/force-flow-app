// Add ExpenseItem.tsx
import React, {useEffect, useState} from 'react';
import {Animated} from 'react-native';
import ReusableInput from '../../ui-lib/reuseable-input';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import ReusableDatePicker from '../../ui-lib/reusable-date-picker';
import {useGetExpenseClaimTypeQuery} from '../../../features/tada/tadaApi';
import {FormikTouched} from 'formik';
import ReusableDropdownv2 from '../../ui-lib/resusable-dropdown-v2';

interface Props {
  values: Record<string, string | any>;
  errors: Record<string, string | any>;
  touched: Record<
    string,
    boolean | FormikTouched<any> | FormikTouched<any>[] | undefined
  >;
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
}
interface DropdownOption {
  label: string;
  value: string;
}

const AddExpenseItemV2: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
}) => {
  const [claimType, setClaimType] = useState<DropdownOption[]>([]);
  const {data} = useGetExpenseClaimTypeQuery();

  const onSelect = (field: string, val: string) => {
    setFieldValue(field, val);
    if (field === 'zone') {
      setFieldValue('state', '');
      setFieldValue('city', '');
    } else if (field === 'state') {
      setFieldValue('city', '');
    }
  };

  useEffect(() => {
    if (data?.data) {
      setClaimType(
        data.data.map(claimType => ({
          label: claimType.name,
          value: claimType.name,
        })),
      );
    }
  }, [data]);

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{padding: 16}}>
      <ReusableDatePicker
        label="Expenses Date"
        value={values.date}
        onChange={(val: string) => setFieldValue('date', val)}
        error={touched.date && errors.date}
      />
      <ReusableDropdownv2
        label="Expense Claim Type"
        field="claim_type"
        value={values.claim_type}
        data={claimType}
        error={touched.claim_type && errors.claim_type}
        onChange={(val: string) => onSelect('claim_type', val)}
      />
      <ReusableInput
        label="Description"
        value={values.description}
        onChangeText={handleChange('description')}
        onBlur={() => handleBlur('description')}
        error={touched.description && errors.description}
      />
      <ReusableInput
        label="Amount"
        value={values.amount}
        onChangeText={handleChange('amount')}
        onBlur={() => handleBlur('amount')}
        error={touched.amount && errors.amount}
        keyboardType="numeric"
      />
    </Animated.ScrollView>
  );
};

export default AddExpenseItemV2;
