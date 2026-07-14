/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import ReusableDatePicker from '../../../ui-lib/reusable-date-picker';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { Colors } from '../../../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../../types/Navigation';
import StoreDropdownField from './StoreDropdownField';
import { useAppSelector } from '../../../../store/hook';
import {
  useLazyGetLastPjpStoresQuery,
  useGetActivityLocationsQuery,
} from '../../../../features/base/base-api';
import { Square, CheckSquare, Plus, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { PlannedActivity } from '../../../../types/baseType';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';

interface FormValues {
  employee: string;
  date: string;
  stores: { store: string }[];
  planned_activities?: PlannedActivity[];
}

type NavigationProp = NativeStackNavigationProp<SoAppStackParamList, 'AddPjpScreen'>;

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
    <T_1 = string | React.ChangeEvent<any>>(field: T_1): T_1 extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
  employeeList: { label: string; value: string }[];
  employeeOgData: any[];
  employeeSearch: string;
  setEmployeeSearch: (val: string) => void;
  onLoadMoreEmployees: () => void;
  loadingMoreEmployees: boolean;
  isPjpStarted: boolean;
  initialStoreCount?: number;
  initialActivityCount?: number;
}

const ACTIVITY_TYPES = [
  { label: 'New Store Inauguration', value: 'New Store Inauguration' },
  { label: 'Distributor Onboarding', value: 'Distributor Onboarding' },
  { label: 'Promoter Meet', value: 'Promoter Meet' },
  { label: 'Team Meeting', value: 'Team Meeting' },
  { label: 'Work From Home', value: 'Work From Home' },
  { label: 'Office Visit', value: 'Office Visit' },
];
const AddPjpForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  setFieldValue,
  scrollY,
  isPjpStarted,
  initialStoreCount = 0,
  initialActivityCount = 0,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const employeeName = employee?.full_name || '—';
  const employeeId = employee?.company_emp_id || '—';
  const totalStores = values.stores.length;
  const plannedActivities = values.planned_activities ?? [];

  const [useLastPjp, setUseLastPjp] = useState(false);
  const [getLastPjpStores, { isFetching: isFetchingLastPjp }] =
    useLazyGetLastPjpStoresQuery();

  const [activityTypeSearches, setActivityTypeSearches] = useState<Record<number, string>>({});
  const [locationSearches, setLocationSearches] = useState<Record<number, string>>({});

  const { data: locationsData } = useGetActivityLocationsQuery();
  const locations = React.useMemo(
    () =>
      locationsData?.message?.data?.map(loc => ({
        label: `${loc.location_name} — Created by ${loc.employee_name}`,
        value: loc.location_name,
      })) || [],
    [locationsData],
  );

  const handleToggleLastPjp = async () => {
    const newValue = !useLastPjp;
    setUseLastPjp(newValue);

    if (newValue) {
      try {
        const response = await getLastPjpStores({ employee: values.employee }).unwrap();
        if (
          response?.message?.status === 'success' &&
          response?.message?.data?.length > 0
        ) {
          const previousStores = response.message.data.map(item => ({
            store: item.store,
          }));
          setFieldValue('stores', previousStores);
          Toast.show({
            type: 'success',
            text1: 'Previous PJP stores loaded successfully',
          });
        } else {
          setUseLastPjp(false);
          Toast.show({
            type: 'info',
            text1: 'No previous PJP data found',
          });
        }
      } catch (error) {
        setUseLastPjp(false);
        Toast.show({
          type: 'error',
          text1: 'Failed to fetch previous PJP data',
        });
      }
    } else {
      setFieldValue('stores', [{ store: '' }]);
    }
  };

  // ── Planned Activity helpers ─────────────────────────────────────────────
  const addActivity = () => {
    setFieldValue('planned_activities', [
      ...plannedActivities,
      { activity_type: '', activity_location: '' },
    ]);
  };

  const removeActivity = (index: number) => {
    const updated = [...plannedActivities];
    updated.splice(index, 1);
    setFieldValue('planned_activities', updated);
  };

  const updateActivity = (
    index: number,
    field: keyof PlannedActivity,
    val: string,
  ) => {
    const updated = [...plannedActivities];
    updated[index] = { ...updated[index], [field]: val };
    setFieldValue('planned_activities', updated);
  };

  return (
    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
      )}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 100 }}>

      {/* ── Employee + Date Row ── */}
      <View style={{
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: Colors.Orangelight, fontFamily: Fonts.medium, marginBottom: 4 }}>
            EMPLOYEE
          </Text>
          <View style={{
            // flex: 1,
            flexDirection: 'column',
            backgroundColor: Colors.Orangelight + '10',
            borderWidth: 1,
            borderColor: Colors.Orangelight + '30',
            borderRadius: 7,
            paddingHorizontal: 5,
            paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 12, color: '#111', fontFamily: Fonts.medium, marginTop: 1 }}
              numberOfLines={1}>
              {employeeName}
            </Text>
            <Text style={{ fontSize: 10, color: '#111', fontFamily: Fonts.medium }}>
              ({employeeId})
            </Text>
          </View>

        </View>
        <View style={{ flex: 1 }}>
          <ReusableDatePicker
            label="Date"
            value={values.date}
            onChange={(val: string) => setFieldValue('date', val)}
            error={touched.date && errors.date}
            marginBottom={0}
            textSize={Size.xs}
          />
        </View>
      </View>

      {/* ── Use Previous PJP Checkbox ── */}
      <TouchableOpacity
        onPress={handleToggleLastPjp}
        disabled={isFetchingLastPjp}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          marginTop: 4,
          gap: 8,
        }}>
        {isFetchingLastPjp ? (
          <ActivityIndicator size="small" color={Colors.Orangelight} />
        ) : useLastPjp ? (
          <CheckSquare size={18} color={Colors.Orangelight} />
        ) : (
          <Square size={18} color={Colors.Orangelight} />
        )}
        <Text
          style={{
            fontSize: 13,
            fontFamily: Fonts.medium,
            color: '#444',
          }}>
          Get previous PJP store data
        </Text>
      </TouchableOpacity>

      {/* ═══════════════════════════════════════════════════════════════════
          STORES SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
        marginBottom: 4,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: '#333' }}>
            Stores
          </Text>
          {plannedActivities.length === 0 && totalStores < 15 && (
            <Text style={{ color: '#F59E0B', fontSize: 11 }}>
              ⚠️ Min 15 stores
            </Text>
          )}
          {plannedActivities.length > 0 && totalStores === 0 && (
            <Text style={{ color: Colors.success ?? '#16a34a', fontSize: 11 }}>
              ✓ Stores optional (activity planned)
            </Text>
          )}
        </View>
        <Text style={{
          fontSize: 11,
          fontFamily: Fonts.medium,
          color: totalStores >= 15 || plannedActivities.length > 0
            ? Colors.Orangelight
            : '#F59E0B',
        }}>
          {totalStores} / 15
        </Text>
      </View>

      {/* ── Store List ── */}
      {values.stores.map((storeItem, index) => (
        <View key={index} style={{}}>
          <StoreDropdownField
            label={`Store ${index + 1}`}
            field={`stores[${index}].store`}
            value={storeItem.store}
            error={touched.stores?.[index]?.store && errors.stores?.[index]?.store}
            onChange={(val: string) => {
              const updatedStores = [...values.stores];
              updatedStores[index].store = val;
              setFieldValue('stores', updatedStores);
            }}
            navigation={navigation}
            disabled={index < initialStoreCount}
          />

          {values.stores.length > 1 && index !== 0 && index >= initialStoreCount && !(isPjpStarted && storeItem.store) && (
            <TouchableOpacity
              onPress={() => {
                const updated = [...values.stores];
                updated.splice(index, 1);
                setFieldValue('stores', updated);
              }}
              style={{ alignSelf: 'flex-end', marginTop: 0 }}>
              <Text style={{ color: '#DC2626', fontSize: 11, fontFamily: Fonts.medium }}>
                Remove
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* ── Add Store Button ── */}
      <TouchableOpacity
        onPress={() => setFieldValue('stores', [...values.stores, { store: '' }])}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: Colors.Orangelight,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 6,
          marginBottom: 20,
        }}>
        <Text style={{ fontFamily: Fonts.medium, fontSize: Size.xs, color: '#fff' }}>
          + Add Store
        </Text>
      </TouchableOpacity>

      {/* ═══════════════════════════════════════════════════════════════════
          PLANNED ACTIVITIES SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <View style={{
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 14,
        marginBottom: 10,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <View>
            <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: '#333' }}>
              Planned Activities
            </Text>
            <Text style={{ fontSize: 10, fontFamily: Fonts.regular, color: '#888', marginTop: 1 }}>
              {plannedActivities.length === 0
                ? 'Optional if stores are added'
                : `${plannedActivities.length} activity${plannedActivities.length > 1 ? 'ies' : ''} planned`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={addActivity}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#EFF6FF',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#BFDBFE',
            }}>
            <Plus size={13} color="#3B82F6" />
            <Text style={{ fontFamily: Fonts.medium, fontSize: Size.xs, color: '#3B82F6' }}>
              Add Activity
            </Text>
          </TouchableOpacity>
        </View>

        {plannedActivities.length === 0 && (
          <View style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderStyle: 'dashed',
          }}>
            <Text style={{ fontSize: 11, color: '#9CA3AF', fontFamily: Fonts.regular, textAlign: 'center' }}>
              No activities planned.{'\n'}Add an activity like "Store Inauguration" or "Distributor Meeting".
            </Text>
          </View>
        )}

        {plannedActivities.map((activity, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#F0F7FF',
              borderRadius: 10,
              padding: 8,
              marginBottom: 5,
              borderWidth: 1,
              borderColor: '#BFDBFE',
            }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2,
            }}>
              <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: '#1D4ED8' }}>
                Activity {index + 1}
              </Text>
              {index >= initialActivityCount && (
                <TouchableOpacity onPress={() => removeActivity(index)}>
                  <Trash2 size={15} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 5 }}>

              <View style={{ width: '49%' }}>
                {/* Activity Type */}
                <ReusableDropdown
                  label="Activity Type"
                  field={`planned_activities[${index}].activity_type`}
                  value={activity.activity_type}
                  data={ACTIVITY_TYPES}
                  onChange={(val: string) => updateActivity(index, 'activity_type', val)}
                  searchText={activityTypeSearches[index] || ''}
                  setSearchText={(val: string) =>
                    setActivityTypeSearches(prev => ({ ...prev, [index]: val }))
                  }
                  marginBottom={0}
                  textSize={12}
                  disabled={index < initialActivityCount}
                  error={
                    (touched as any)?.planned_activities?.[index]?.activity_type &&
                      (errors as any)?.planned_activities?.[index]?.activity_type
                      ? (errors as any).planned_activities[index].activity_type
                      : undefined
                  }
                />
              </View>

              <View style={{ width: '49%' }}>
                {/* Activity Location */}
                <ReusableDropdown
                  label="Activity Location"
                  field={`planned_activities[${index}].activity_location`}
                  placeholder="Choose location"
                  data={locations}
                  value={activity.activity_location}
                  onChange={(val: string) => updateActivity(index, 'activity_location', val)}
                  searchText={locationSearches[index] || ''}
                  setSearchText={(val: string) =>
                    setLocationSearches(prev => ({ ...prev, [index]: val }))
                  }
                  showAddButton={true}
                  addButtonText="Register New Location"
                  onAddPress={() => navigation.navigate('AddActivityLocationScreen')}
                  marginBottom={0}
                  textSize={12}
                  disabled={index < initialActivityCount}
                  error={
                    (touched as any)?.planned_activities?.[index]?.activity_location &&
                      (errors as any)?.planned_activities?.[index]?.activity_location
                      ? (errors as any).planned_activities[index].activity_location
                      : undefined
                  }
                />
              </View>
            </View>
          </View>
        ))}
      </View>

    </Animated.ScrollView>
  );
};

export default AddPjpForm;