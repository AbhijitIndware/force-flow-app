import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import {
    useGetActivityLocationsQuery,
    useActivityCheckInMutation
} from '../../../features/base/base-api';
import { getCurrentLocation, requestLocationPermission } from '../../../utils/utils';
import Toast from 'react-native-toast-message';
import { Camera, MapPin, MapPinPlus, Navigation, PlayCircle } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import { launchCamera } from 'react-native-image-picker';

type NavigationProp = NativeStackNavigationProp<SoAppStackParamList, 'ActivityCheckInScreen'>;

const LOCATION_TYPES = [
    { label: 'Office Visit', value: 'Office Visit' },
    { label: 'Miscellaneous Visit', value: 'Miscellaneous Visit' },
    { label: 'Distributor Point', value: 'Distributor Point' },
    { label: 'Key Account', value: 'Key Account' },
    { label: 'New Account Opening', value: 'New Account Opening' },
    { label: 'Distributor Opening', value: 'Distributor Opening' },
];

const TYPES_WITH_TEXT_INPUT = ['Office Visit', 'Miscellaneous Visit', 'Key Account'];
const ActivityCheckInScreen = ({ navigation }: { navigation: NavigationProp }) => {
    const [selectedLocation, setSelectedLocation] = useState('');
    const [image, setImage] = useState<{ mime: string; data: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('');


    const [locationName, setLocationName] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [locationDetail, setLocationDetail] = useState('');


    const showDetailInput = TYPES_WITH_TEXT_INPUT.includes(locationName);

    const filteredLocationTypes = LOCATION_TYPES.filter((item) =>
        item.label.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const { data: locationsData, isLoading: isLocationsLoading } = useGetActivityLocationsQuery();
    const [checkIn] = useActivityCheckInMutation();

    const locations = locationsData?.message?.data?.map(loc => ({
        label: loc.location_name,
        value: loc.location_name,
    })) || [];

    const fetchLatestLocation = async () => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return;
            const loc = await getCurrentLocation();
            setCurrentLocation(loc);
        } catch (error) {
            console.log('Location fetch error:', error);
        }
    };

    React.useEffect(() => {
        fetchLatestLocation();
    }, []);

    const handleTakeSelfie = async () => {
        launchCamera(
            {
                mediaType: 'photo',
                cameraType: 'front',
                quality: 0.8,
                includeBase64: true,
                saveToPhotos: false,
            },
            response => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert('Camera Error', response.errorMessage);
                    return;
                }
                if (response.assets && response.assets.length > 0) {
                    const photo = response.assets[0];
                    if (photo.base64 && photo.type) {
                        setImage({
                            mime: photo.type,
                            data: photo.base64,
                        });
                    }
                }
            },
        );
    };

    const handleConfirmCheckIn = async () => {
        if (!selectedLocation) {
            Toast.show({ type: 'error', text1: 'Please select a location' });
            return;
        }
        if (!image) {
            Toast.show({ type: 'error', text1: 'Please take a selfie' });
            return;
        }
        setConfirmModalVisible(true);
    };

    const handleFinalSubmit = async () => {
        try {
            setIsSubmitting(true);

            // 🔥 Force fresh location
            const locationStr = await getCurrentLocation();
            setCurrentLocation(locationStr);

            if (!locationStr) {
                Toast.show({ type: 'error', text1: 'Unable to fetch location' });
                return;
            }

            const res = await checkIn({
                activity_location: selectedLocation,
                current_location: locationStr,
                image: image as { mime: string; data: string },
            }).unwrap();

            if (res.message.success) {
                Toast.show({ type: 'success', text1: 'Checked in successfully' });
                setConfirmModalVisible(false);

                if (locationName === 'New Account Opening') {
                    navigation.navigate('PartnersScreen', { index: 1 });
                } else if (locationName === 'Distributor Opening') {
                    navigation.navigate('PartnersScreen', { index: 0 });
                } else {
                    navigation.goBack();
                }
            } else {
                Alert.alert('Check-In Failed', res.message.message);
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: error?.data?.message || 'Failed to check in'
            });
        } finally {
            setIsSubmitting(false);
            setConfirmModalVisible(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <PageHeader title="Activity Check-In" navigation={() => navigation.goBack()} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.form}>
                        {/* Location Name Dropdown */}
                        <ReusableDropdown
                            label="Activity Type"
                            field="value"
                            value={locationName}
                            data={filteredLocationTypes}
                            onChange={(item: any) => {
                                setLocationName(item)
                            }}
                            searchText={locationSearch}
                            setSearchText={setLocationSearch}
                            marginBottom={0}
                        />
                        {/* Conditional Detail Text Input */}
                        {showDetailInput && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Remarks For {locationName}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={`Enter remarks`}
                                    placeholderTextColor={Colors.gray}
                                    value={locationDetail}
                                    onChangeText={setLocationDetail}
                                />
                            </View>
                        )}
                        <View style={styles.inputGroup}>
                            <ReusableDropdown
                                label="Select Activity Location"
                                placeholder="Choose location"
                                data={locations}
                                value={selectedLocation}
                                onChange={setSelectedLocation}
                                field="value"
                                showAddButton={true}
                                addButtonText="Register New Location"
                                onAddPress={() => navigation.navigate('AddActivityLocationScreen')}
                                marginBottom={0}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Required Selfie</Text>
                            <Text style={styles.sectionSubtitle}>Please take a photo at the location</Text>

                            <TouchableOpacity style={styles.cameraBtn} onPress={handleTakeSelfie}>
                                {image ? (
                                    <Image
                                        source={{ uri: `data:${image.mime};base64,${image.data}` }}
                                        style={styles.previewImage}
                                    />
                                ) : (
                                    <View style={styles.cameraPlaceholder}>
                                        <Camera size={40} color={Colors.gray} />
                                        <Text style={styles.cameraText}>Tap to open camera</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <Modal
                    visible={confirmModalVisible}
                    transparent
                    animationType="fade">
                    <View style={modalStyles.overlay}>
                        <View style={modalStyles.container}>
                            <Text style={modalStyles.title}>Confirm Activity</Text>
                            <Text style={modalStyles.subtitle}>
                                Please verify your activity location
                            </Text>

                            <View style={modalStyles.divider} />

                            <View style={modalStyles.row}>
                                <Text style={modalStyles.label}>Activity Location</Text>
                                <Text style={modalStyles.value}>{selectedLocation}</Text>
                            </View>

                            <View style={modalStyles.row}>
                                <Text style={modalStyles.label}>Current Location</Text>
                                <Text style={modalStyles.locationText}>{currentLocation || 'Fetching...'}</Text>
                            </View>

                            <View style={modalStyles.divider} />

                            <View style={modalStyles.actions}>
                                <TouchableOpacity
                                    style={modalStyles.cancelBtn}
                                    onPress={() => setConfirmModalVisible(false)}>
                                    <Text style={modalStyles.cancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={modalStyles.confirmBtn}
                                    onPress={handleFinalSubmit}
                                    disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <ActivityIndicator color={Colors.white} />
                                    ) : (
                                        <Text style={modalStyles.confirmText}>Check-In Now</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, (isSubmitting || isLocationsLoading) && { opacity: 0.7 }]}
                        onPress={handleConfirmCheckIn}
                        disabled={isSubmitting || isLocationsLoading}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <PlayCircle size={20} color={Colors.white} style={{ marginRight: 8 }} />
                                <Text style={styles.submitText}>Confirm Check-In</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ActivityCheckInScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    scrollContent: {
        padding: 20,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        // marginTop: 10,
    },
    label: {
        fontFamily: Fonts.medium,
        fontSize: Size.xs,
        color: '#374151',
    },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontFamily: Fonts.regular,
        fontSize: Size.sm,
        color: Colors.darkButton,
        marginBottom: 0
    },
    section: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    sectionTitle: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.md,
        color: Colors.darkButton,
    },
    sectionSubtitle: {
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: Colors.gray,
        marginTop: 4,
        marginBottom: 20,
    },
    cameraBtn: {
        width: 250,
        height: 250,
        borderRadius: 20,
        backgroundColor: '#F8F9FB',
        borderWidth: 2,
        borderColor: '#E2E4E9',
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraPlaceholder: {
        alignItems: 'center',
        gap: 12,
    },
    cameraText: {
        fontFamily: Fonts.medium,
        fontSize: Size.xs,
        color: Colors.gray,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    footer: {
        padding: 20,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitBtn: {
        backgroundColor: Colors.darkButton,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    submitText: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.sm,
        color: Colors.white,
    },
});

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '88%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 14,
    },
    row: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    locationText: {
        fontSize: 12,
        color: '#374151',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        marginRight: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: '#374151',
        fontWeight: '600',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#16A34A',
        alignItems: 'center',
    },
    confirmText: {
        color: Colors.white,
        fontWeight: '700',
    },
});
