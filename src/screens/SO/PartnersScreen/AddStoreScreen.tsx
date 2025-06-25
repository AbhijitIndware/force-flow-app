import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useMemo, useRef, useState } from 'react';
import { useFormik } from 'formik';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PageHeader from '../../../components/ui/PageHeader';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import DropdownComponent from '../../../components/ui/CustomDropDown';
import { storeSchema } from '../../../types/schema';
import { SoAppStackParamList } from '../../../types/Navigation';
import {
    useGetCityQuery,
    useGetDistributorQuery,
    useGetItemGroupQuery,
    useGetStateQuery,
    useGetStoreCategoryQuery,
    useGetStoreTypeQuery,
    useGetZoneQuery,
} from '../../../features/dropdown/dropdown-api';
import { useAddStoreMutation } from '../../../features/base/base-api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { useAppSelector } from '../../../store/hook';
import { Animated } from 'react-native';

const initial = {
    store_name: '',
    store_type: '',
    store_category: '',
    zone: '',
    state: '',
    city: '',
    map_location: '',
    start_time: '',
    end_time: '',
    pan_no: '',
    gst_no: '',
    pin_code: '',
    distributor: '',
    address: '',
    weekly_off: '',

    created_by_employee: '',
    created_by_employee_name: '',
    created_by_employee_designation: '',
};

const weekOffList = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
];


const AddStoreScreen = ({ navigation }: { navigation: NativeStackNavigationProp<SoAppStackParamList, 'AddStoreScreen'> }) => {
    const [loading, setLoading] = useState(false);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [activeField, setActiveField] = useState<'start_time' | 'end_time' | null>(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    const user = useAppSelector(
        state => state?.persistedReducer?.authSlice?.user,
    );
    const employee = useAppSelector(
        state => state?.persistedReducer?.authSlice?.employee,
    );

    const { data: cityData } = useGetCityQuery();
    const { data: stateData } = useGetStateQuery();
    const { data: zoneData } = useGetZoneQuery();
    const { data: distributorData } = useGetDistributorQuery();
    const { data: typeData } = useGetStoreTypeQuery();
    const { data: categoryData } = useGetStoreCategoryQuery();


    const [addStore] = useAddStoreMutation();

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
    } = useFormik({
        initialValues: initial,
        validationSchema: storeSchema,
        onSubmit: async (formValues, actions) => {
            try {
                setLoading(true);
                let value = {
                    ...formValues,
                    created_by_employee: employee.id, // Replace with actual user ID
                    created_by_employee_name: user?.full_name, // Replace with actual user name
                    created_by_employee_designation: employee.designation, // Replace with actual designation
                }

                const payload = { data: value };
                console.log("🚀 ~ onSubmit: ~ payload:", payload)
                const res = await addStore(payload).unwrap();
                console.log('Store API Response:', res);

                if (res?.message?.status === 'success') {
                    Toast.show({
                        type: 'success',
                        text1: `✅ ${res.message.message}`,
                        position: 'top',
                    });
                    actions.resetForm();
                    navigation.navigate('PartnersScreen')
                } else {
                    Toast.show({
                        type: 'error',
                        text1: `❌ ${res.message.message || 'Something went wrong'}`,
                        position: 'top',
                    });
                }
                setLoading(false);
            } catch (error: any) {
                console.error('Store API Error:', error);
                Toast.show({
                    type: 'error',
                    text1: `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
                    text2: 'Please try again later.',
                    position: 'top',
                });
                setLoading(false);
            }
        },
    });

    const transformList = (arr: { name: string }[] = []) => arr.map(i => ({ label: i.name, value: i.name }));

    const zoneList = useMemo(() => transformList(zoneData?.message?.data), [zoneData]);
    const stateList = useMemo(() => {
        return transformList(stateData?.message?.data?.filter(state => state.zone === values.zone));
    }, [stateData, values.zone]);

    const cityList = useMemo(() => {
        return transformList(cityData?.message?.data?.filter(city => city.state === values.state));
    }, [cityData, values.state]);

    const distributorList = transformList(distributorData?.message?.data);

    const storeTypeList = transformList(typeData?.message?.data);
    const storeCategoryList = transformList(categoryData?.message?.data);


    const renderInput = (label: string, field: keyof typeof values) => {
        let keyboardType: 'default' | 'email-address' | 'numeric' = 'default';

        if (field === 'pin_code') {
            keyboardType = 'numeric';
        }

        return (
            <View style={styles.inputWrapper}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={`Enter ${label}`}
                    value={values[field]}
                    onChangeText={handleChange(field)}
                    onBlur={handleBlur(field)}
                    placeholderTextColor="#999"
                    keyboardType={keyboardType}
                />
                {touched[field] && errors[field] && (
                    <Text style={styles.error}>{errors[field]}</Text>
                )}
            </View>
        );
    };
    const renderDropdown = (
        label: string,
        field: keyof typeof values,
        data: { label: string; value: string }[] = []
    ) => {
        const handleSelect = (val: string) => {
            setFieldValue(field, val);

            // Reset dependent fields
            if (field === 'zone') {
                setFieldValue('state', ''); // Reset state
                setFieldValue('city', '');  // Reset city
            } else if (field === 'state') {
                setFieldValue('city', '');  // Reset city
            }
        };

        return (
            <View style={styles.inputWrapper}>
                <Text style={styles.label}>{label}</Text>
                <DropdownComponent
                    selectText={label}
                    data={data}
                    selectedId={values[field] ? String(values[field]) : null}
                    setSelectedId={handleSelect}
                    name={field}
                />
                {touched[field] && errors[field] && (
                    <Text style={styles.error}>{errors[field]}</Text>
                )}
            </View>
        );
    };


    const renderTimePicker = (label: string, field: 'start_time' | 'end_time') => (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.timeInput}
                onPress={() => {
                    setActiveField(field);
                    setTimePickerVisible(true);
                }}>
                <Text style={styles.timeText}>
                    {values[field] ? moment(values[field], 'HH:mm:ss').format('hh:mm A') : `Select ${label}`}
                </Text>
            </TouchableOpacity>
            {touched[field] && errors[field] && (
                <Text style={styles.error}>{errors[field]}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
            <PageHeader title="Add Store" navigation={() => navigation.goBack()} />
            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={(date: Date) => {
                    if (activeField) {
                        const formatted = moment(date).format('HH:mm:ss');
                        setFieldValue(activeField, formatted);
                    }
                    setTimePickerVisible(false);
                }}
                onCancel={() => setTimePickerVisible(false)}
            />
            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false },
                )}
                scrollEventThrottle={16} contentContainerStyle={{ padding: 16 }}>
                {renderInput('Store Name', 'store_name')}
                {renderDropdown('Store Type', 'store_type', storeTypeList)}
                {renderDropdown('Store Category', 'store_category', storeCategoryList)}
                {renderDropdown('Zone', 'zone', zoneList)}
                {renderDropdown('State', 'state', stateList)}
                {renderDropdown('City', 'city', cityList)}
                {renderDropdown('Weekly Off', 'weekly_off', weekOffList)}
                {renderDropdown('Distributor', 'distributor', distributorList)}
                {renderInput('Map Location', 'map_location')}
                {renderTimePicker('Start Time', 'start_time')}
                {renderTimePicker('End Time', 'end_time')}
                {renderInput('PAN No', 'pan_no')}
                {renderInput('GST No', 'gst_no')}
                {renderInput('PIN Code', 'pin_code')}
                {renderInput('Address', 'address')}
            </Animated.ScrollView>
            <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={() => handleSubmit()}
                disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                    <Text style={styles.submitText}>Submit</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default AddStoreScreen;

const styles = StyleSheet.create({
    inputWrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
        color: Colors.black,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        color: Colors.black,
    },
    error: {
        fontSize: 12,
        color: 'red',
        marginTop: 4,
    },
    submitBtn: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 6,
        marginHorizontal: 16,
    },
    submitText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeInput: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    timeText: {
        color: Colors.black,
        fontSize: 16,
    },
});
