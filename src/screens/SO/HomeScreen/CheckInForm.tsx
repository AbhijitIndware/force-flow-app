import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
} from 'react-native';
import React, { useRef, useState } from 'react'
import { Colors } from '../../../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useAppSelector } from '../../../store/hook';
import { useFormik } from 'formik';
import { useAddCheckInMutation } from '../../../features/base/base-api';
import { useGetDailyStoreQuery, useGetStoreQuery } from '../../../features/dropdown/dropdown-api';
import { checkInSchema, storeSchema } from '../../../types/schema';
import Toast from 'react-native-toast-message';
import { flexCol } from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import AddCheckInForm from '../../../components/SO/Home/check-in-form';


type NavigationProp = NativeStackNavigationProp<
    SoAppStackParamList,
    'CheckInForm'
>;

type Props = {
    navigation: NavigationProp;
    route: any;
};


let initial = {
    date: "",
    employee: '',
    store: "",
    image: null
}
const CheckInForm = ({ navigation }: Props) => {
    const [loading, setLoading] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const user = useAppSelector(
        state => state?.persistedReducer?.authSlice?.user,
    );
    const employee = useAppSelector(
        state => state?.persistedReducer?.authSlice?.employee,
    );

    const [addCheckIn] = useAddCheckInMutation();
    const { data: storeData } = useGetDailyStoreQuery();

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
        validationSchema: checkInSchema,
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
                const res = await addCheckIn(payload).unwrap();

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
    const storeDailyList = transformList(storeData?.message?.data);



    return (
        <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
            <PageHeader title="Check In" navigation={() => navigation.goBack()} />
            <AddCheckInForm
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
                scrollY={scrollY}
                storeList={storeDailyList}
            />
            <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={() => handleSubmit()}
                disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                    <Text style={styles.submitText}>CheckIn</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

export default CheckInForm;


const styles = StyleSheet.create({
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
