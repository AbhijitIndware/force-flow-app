import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { useMemo, useRef, useState } from 'react';
import { useFormik } from 'formik';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import DropdownComponent from '../../../components/ui/CustomDropDown';
import { distributorSchema } from '../../../types/schema';
import {
    useGetCityQuery,
    useGetDesignationQuery,
    useGetDistributorGroupQuery,
    useGetEmployeeQuery,
    useGetStateQuery,
    useGetZoneQuery,
} from '../../../features/dropdown/dropdown-api';
import { REmployee } from '../../../types/dropdownType';
import { useAddDistributorMutation } from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';


type NavigationProp = NativeStackNavigationProp<
    SoAppStackParamList,
    'AttendanceScreen'
>;

type Props = {
    navigation: NavigationProp;
    route: any;
};

let initial = {
    distributor_name: '',
    distributor_sap_code: '',
    distributor_group: '',
    distributor_code: '',
    mobile: '',
    email: '',
    employee: '',
    zone: '',
    state: '',
    city: '',
    reports_to: '',
    designation: '',
}

const AddDistributorScreen = ({ navigation }: Props) => {
    const [loading, setLoading] = useState(false);
    const { data: cityData } = useGetCityQuery();
    const { data: stateData } = useGetStateQuery();
    const { data: zoneData } = useGetZoneQuery();
    const { data: employeeData } = useGetEmployeeQuery();
    const { data: designationData } = useGetDesignationQuery();
    const { data: distributorGroupData, error } = useGetDistributorGroupQuery();
    const scrollY = useRef(new Animated.Value(0)).current;

    const [addDistributor] = useAddDistributorMutation();

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
        validationSchema: distributorSchema,
        onSubmit: async (formValues, actions) => {
            try {
                setLoading(true);
                const payload = { data: formValues };
                const res = await addDistributor(payload).unwrap();

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
                console.error('Distributor API Error:', error);
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


    const transformToDropdownList = (arr: { name: string }[] = []) =>
        arr.map(item => ({ label: item.name, value: item.name }));

    const transformEmployeeList = (arr: REmployee['message']['data'] = []) =>
        arr.map(item => ({
            label: `${item.employee_name} (${item.designation})`,
            value: item.name,
        }));

    const distributorGroupList = transformToDropdownList(distributorGroupData?.message?.data);

    const employeeList = transformEmployeeList(employeeData?.message?.data);
    const zoneList = useMemo(() => transformToDropdownList(zoneData?.message?.data), [zoneData]);
    const stateList = useMemo(() => {
        return transformToDropdownList(stateData?.message?.data?.filter(state => state.zone === values.zone));
    }, [stateData, values.zone]);

    const cityList = useMemo(() => {
        return transformToDropdownList(cityData?.message?.data?.filter(city => city.state === values.state));
    }, [cityData, values.state]);

    const designationList = transformToDropdownList(designationData?.message?.data);


    const renderInput = (label: string, field: keyof typeof values) => {
        let keyboardType: 'default' | 'email-address' | 'numeric' = 'default';

        if (field === 'email') {
            keyboardType = 'email-address';
        } else if (field === 'mobile') {
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


    return (
        <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
            <PageHeader title="Add Distributor" navigation={() => navigation.goBack()} />
            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false },
                )}
                scrollEventThrottle={16} contentContainerStyle={{ padding: 16 }}>
                {renderInput('Distributor Name', 'distributor_name')}
                {renderInput('SAP Code', 'distributor_sap_code')}
                {renderDropdown('Group', 'distributor_group', distributorGroupList)}
                {renderDropdown('Employee', 'employee', employeeList)}
                {renderDropdown('Zone', 'zone', zoneList)}
                {renderDropdown('State', 'state', stateList)}
                {renderDropdown('City', 'city', cityList)}
                {renderDropdown('Reports To', 'reports_to', employeeList)}
                {renderDropdown('Designation', 'designation', designationList)}
                {renderInput('Distributor Code', 'distributor_code')}
                {renderInput('Mobile', 'mobile')}
                {renderInput('Email', 'email')}
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

export default AddDistributorScreen;

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
});
