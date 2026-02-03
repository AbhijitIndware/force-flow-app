// AddDistributorForm.tsx
import React, {useRef} from 'react';
import {Animated, StyleSheet, TouchableOpacity} from 'react-native';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import ReusableInput from '../../../ui-lib/reuseable-input';
import {Text} from 'react-native';
import moment from 'moment';
import {Colors} from '../../../../utils/colors';
import {View} from 'react-native';
import MapReusableInput from '../../../ui-lib/map-input';
import {Size} from '../../../../utils/fontSize';
import {Fonts} from '../../../../constants';

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
  useCityDropdown: boolean;
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
  storeTypeList: {label: string; value: string}[];
  storeCategoryList: {label: string; value: string}[];
  zoneList: {label: string; value: string}[];
  stateList: {label: string; value: string}[];
  cityList: {label: string; value: string}[];
  beatList: {label: string; value: string}[];
  distributorList: {label: string; value: string}[];
  weekOffList: {label: string; value: string}[];
  onTimeSelect: (field: 'start_time' | 'end_time') => void;

  onLoadMoreState?: () => void;
  loadingMoreState?: boolean;
  onLoadMoreCity?: () => void;
  loadingMoreCity?: boolean;
  onLoadMoreZone?: () => void;
  loadingMoreZone?: boolean;

  onLoadMoreType?: () => void;
  loadingMoreType?: boolean;
  onLoadMoreCategory?: () => void;
  loadingMoreCategory?: boolean;
  onLoadMoreDistributor?: () => void;
  loadingMoreDistributor?: boolean;
  onLoadMoreBeat?: () => void;
  loadingMoreBeat?: boolean;

  // 🔍 Search support
  zoneSearchText?: string;
  setZoneSearchText?: (text: string) => void;
  stateSearchText?: string;
  setStateSearchText?: (text: string) => void;
  citySearchText?: string;
  setCitySearchText?: (text: string) => void;

  distributorSearchText?: string;
  setDistributorSearchText?: (text: string) => void;
  typeSearchText?: string;
  setTypeSearchText?: (text: string) => void;
  categorySearchText?: string;
  setCategorySearchText?: (text: string) => void;
  beatSearchText?: string;
  setBeatSearchText?: (text: string) => void;
  isNewCity?: boolean;
}

const AddStoreForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
  storeTypeList,
  storeCategoryList,
  zoneList,
  stateList,
  beatList,
  cityList,
  distributorList,
  weekOffList,
  onTimeSelect,
  useCityDropdown,
  onLoadMoreState,
  loadingMoreState,
  onLoadMoreCity,
  loadingMoreCity,
  onLoadMoreZone,
  loadingMoreZone,

  zoneSearchText,
  setZoneSearchText,
  stateSearchText,
  setStateSearchText,
  citySearchText,
  setCitySearchText,

  distributorSearchText,
  setDistributorSearchText,
  typeSearchText,
  setTypeSearchText,
  categorySearchText,
  setCategorySearchText,
  beatSearchText,
  setBeatSearchText,

  // newly added
  onLoadMoreType,
  loadingMoreType,
  onLoadMoreCategory,
  loadingMoreCategory,
  onLoadMoreDistributor,
  loadingMoreDistributor,
  onLoadMoreBeat,
  loadingMoreBeat,
  isNewCity,
}) => {
  console.log('🚀 ~ AddStoreForm ~ isNewCity:', isNewCity);
  const scrollViewRef = useRef<any>(null);

  const onSelect = (field: string, val: string) => {
    setFieldValue(field, val);
    if (field === 'zone') {
      setFieldValue('state', '');
      setFieldValue('city', '');
    } else if (field === 'state') {
      setFieldValue('city', '');
    }
  };

  const scrollUpOnFocus = (yOffset: number = 250) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.getNode?.()?.scrollTo?.({
        y: yOffset,
        animated: true,
      });
    });
  };

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{padding: 16, paddingHorizontal: 21}}>
      <ReusableInput
        label="Store Name"
        value={values.store_name}
        onChangeText={handleChange('store_name')}
        onBlur={() => handleBlur('store_name')}
        error={touched.store_name && errors.store_name}
      />
      <ReusableDropdown
        label="Store Type"
        field="store_type"
        value={values.store_type}
        data={storeTypeList}
        error={touched.store_type && errors.store_type}
        onChange={(val: string) => onSelect('store_type', val)}
        onLoadMore={onLoadMoreType}
        loadingMore={loadingMoreType}
        searchText={typeSearchText}
        setSearchText={setTypeSearchText}
      />
      <ReusableDropdown
        label="Store Category"
        field="store_category"
        value={values.store_category}
        data={storeCategoryList}
        error={touched.store_category && errors.store_category}
        onChange={(val: string) => onSelect('store_category', val)}
        onLoadMore={onLoadMoreCategory}
        loadingMore={loadingMoreCategory}
        searchText={categorySearchText}
        setSearchText={setCategorySearchText}
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
        searchText={zoneSearchText}
        setSearchText={setZoneSearchText}
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
        searchText={stateSearchText}
        setSearchText={setStateSearchText}
      />

      <MapReusableInput
        label="Map Location"
        value={values.map_location}
        onChangeText={handleChange('map_location')}
        onBlur={() => handleBlur('map_location')}
        error={touched.map_location && errors.map_location}
      />
      {/* <ReusableDropdown
        label="City"
        field="city"
        value={values.city}
        data={cityList}
        error={touched.city && errors.city}
        onChange={(val: string) => onSelect('city', val)}
        onLoadMore={onLoadMoreCity}
        loadingMore={loadingMoreCity}
        searchText={citySearchText}
        setSearchText={setCitySearchText}
        onOpen={() => scrollUpOnFocus(400)}
      /> */}
      {useCityDropdown ? (
        <ReusableDropdown
          label="City"
          field="city"
          value={values.city}
          data={cityList}
          error={touched.city && errors.city}
          onChange={(val: string) => onSelect('city', val)}
          onLoadMore={onLoadMoreCity}
          loadingMore={loadingMoreCity}
          searchText={citySearchText}
          setSearchText={setCitySearchText}
          onOpen={() => scrollUpOnFocus(400)}
        />
      ) : (
        <ReusableInput
          label="City"
          value={values.city}
          disabled={isNewCity === false}
          onChangeText={handleChange('city')}
          onBlur={() => handleBlur('city')}
          error={touched.city && errors.city}
        />
      )}

      {/* <ReusableDropdown
        label="Beat"
        field="beat"
        value={values.beat}
        data={beatList}
        error={touched.beat && errors.beat}
        onChange={(val: string) => onSelect('beat', val)}
      /> */}
      {/* <ReusableDropdown
        label="Weekly Off"
        field="weekly_off"
        value={values.weekly_off}
        data={weekOffList}
        error={touched.weekly_off && errors.weekly_off}
        onChange={(val: string) => onSelect('weekly_off', val)}
      /> */}
      <ReusableDropdown
        label="Distributor"
        field="distributor"
        value={values.distributor}
        data={distributorList}
        error={touched.distributor && errors.distributor}
        onChange={(val: string) => onSelect('distributor', val)}
        onLoadMore={onLoadMoreDistributor}
        loadingMore={loadingMoreDistributor}
        searchText={distributorSearchText}
        setSearchText={setDistributorSearchText}
        onOpen={() => scrollUpOnFocus(400)}
      />

      {/* <View style={styles.inputWrapper}>
        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity
          style={styles.timeInput}
          onPress={() => onTimeSelect('start_time')}>
          <Text style={styles.timeText}>
            {values.start_time
              ? moment(values.start_time, 'HH:mm:ss').format('hh:mm A')
              : 'Select Start Time'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>End Time</Text>
        <TouchableOpacity
          style={styles.timeInput}
          onPress={() => onTimeSelect('end_time')}>
          <Text style={styles.timeText}>
            {values.end_time
              ? moment(values.end_time, 'HH:mm:ss').format('hh:mm A')
              : 'Select End Time'}
          </Text>
        </TouchableOpacity>
      </View> */}
      <ReusableInput
        label="PAN No"
        value={values.pan_no}
        onChangeText={handleChange('pan_no')}
        onBlur={() => handleBlur('pan_no')}
        error={touched.pan_no && errors.pan_no}
      />
      <ReusableInput
        label="GST No"
        value={values.gst_no}
        onChangeText={handleChange('gst_no')}
        onBlur={() => handleBlur('gst_no')}
        error={touched.gst_no && errors.gst_no}
      />
      <ReusableInput
        label="PIN Code"
        value={values.pin_code}
        onChangeText={handleChange('pin_code')}
        onBlur={() => handleBlur('pin_code')}
        error={touched.pin_code && errors.pin_code}
        keyboardType="numeric"
      />
      <ReusableInput
        label="Address"
        value={values.address}
        onChangeText={handleChange('address')}
        onBlur={() => handleBlur('address')}
        error={touched.address && errors.address}
      />
    </Animated.ScrollView>
  );
};

export default AddStoreForm;

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: Size.xs,
    marginBottom: 4,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
  timeInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ecececff',
    height: 50,
  },
  timeText: {
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
  },
});
