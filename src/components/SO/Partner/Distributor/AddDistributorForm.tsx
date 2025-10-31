/* eslint-disable react-native/no-inline-styles */
// AddDistributorForm.tsx
import React from 'react';
import {Animated} from 'react-native';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import ReusableInput from '../../../ui-lib/reuseable-input';

interface Props {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
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
  distributorGroupList: {label: string; value: string}[];
  employeeList: {label: string; value: string}[];
  zoneList: {label: string; value: string}[];
  stateList: {label: string; value: string}[];
  cityList: {label: string; value: string}[];
  designationList: {label: string; value: string}[];

  onLoadMoreState?: () => void;
  loadingMoreState?: boolean;
  onLoadMoreEmployee?: () => void;
  loadingMoreEmployee?: boolean;
  onLoadMoreZone?: () => void;
  loadingMoreZone?: boolean;
  onLoadMoreCity?: () => void;
  loadingMoreCity?: boolean;
}

const AddDistributorForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
  distributorGroupList,
  employeeList,
  zoneList,
  stateList,
  cityList,
  designationList,
  onLoadMoreState,
  loadingMoreState,
  onLoadMoreEmployee,
  loadingMoreEmployee,
  onLoadMoreZone,
  loadingMoreZone,
  onLoadMoreCity,
  loadingMoreCity,
}) => {
  const onSelect = (field: string, val: string) => {
    setFieldValue(field, val);
    if (field === 'zone') {
      setFieldValue('state', '');
      setFieldValue('city', '');
    } else if (field === 'state') {
      setFieldValue('city', '');
    }
  };

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{padding: 16, paddingHorizontal: 21}}>
      <ReusableInput
        label="Distributor Name"
        value={values.distributor_name}
        onChangeText={handleChange('distributor_name')}
        onBlur={() => handleBlur('distributor_name')}
        error={touched.distributor_name && errors.distributor_name}
      />
      <ReusableInput
        label="SAP Code"
        value={values.distributor_sap_code}
        onChangeText={handleChange('distributor_sap_code')}
        onBlur={() => handleBlur('distributor_sap_code')}
        error={touched.distributor_sap_code && errors.distributor_sap_code}
      />
      <ReusableDropdown
        label="Group"
        field="distributor_group"
        value={values.distributor_group}
        data={distributorGroupList}
        error={touched.distributor_group && errors.distributor_group}
        onChange={(val: string) => onSelect('distributor_group', val)}
      />
      <ReusableDropdown
        label="Employee"
        field="employee"
        value={values.employee}
        data={employeeList}
        error={touched.employee && errors.employee}
        onChange={(val: string) => onSelect('employee', val)}
        onLoadMore={onLoadMoreEmployee}
        loadingMore={loadingMoreEmployee}
      />
      <ReusableDropdown
        label="Zone"
        field="zone"
        value={values.zone}
        data={zoneList}
        error={touched.zone && errors.zone}
        onChange={(val: string) => onSelect('zone', val)}
        onLoadMore={onLoadMoreZone}
        loadingMore={loadingMoreZone}
      />
      <ReusableDropdown
        label="State"
        field="state"
        value={values.state}
        data={stateList}
        error={touched.state && errors.state}
        onChange={(val: string) => onSelect('state', val)}
        onLoadMore={onLoadMoreState}
        loadingMore={loadingMoreState}
      />
      <ReusableDropdown
        label="City"
        field="city"
        value={values.city}
        data={cityList}
        error={touched.city && errors.city}
        onChange={(val: string) => onSelect('city', val)}
        onLoadMore={onLoadMoreCity}
        loadingMore={loadingMoreCity}
      />
      <ReusableDropdown
        label="Reports To"
        field="reports_to"
        value={values.reports_to}
        data={employeeList}
        error={touched.reports_to && errors.reports_to}
        onChange={(val: string) => onSelect('reports_to', val)}
      />
      <ReusableDropdown
        label="Designation"
        field="designation"
        value={values.designation}
        data={designationList}
        error={touched.designation && errors.designation}
        onChange={(val: string) => onSelect('designation', val)}
      />
      <ReusableInput
        label="Distributor Code"
        value={values.distributor_code}
        onChangeText={handleChange('distributor_code')}
        onBlur={() => handleBlur('distributor_code')}
        error={touched.distributor_code && errors.distributor_code}
      />
      <ReusableInput
        label="Mobile"
        value={values.mobile}
        onChangeText={handleChange('mobile')}
        onBlur={() => handleBlur('mobile')}
        error={touched.mobile && errors.mobile}
        keyboardType="numeric"
      />
      <ReusableInput
        label="Email"
        value={values.email}
        onChangeText={handleChange('email')}
        onBlur={() => handleBlur('email')}
        error={touched.email && errors.email}
        keyboardType="email-address"
      />
    </Animated.ScrollView>
  );
};

export default AddDistributorForm;
