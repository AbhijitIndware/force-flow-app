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

const ActivityCheckInScreen = ({ navigation }: { navigation: NavigationProp }) => {
    const [selectedLocation, setSelectedLocation] = useState('');
    const [image, setImage] = useState<{ mime: string; data: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: locationsData, isLoading: isLocationsLoading } = useGetActivityLocationsQuery();
    const [checkIn] = useActivityCheckInMutation();

    const locations = locationsData?.message?.data?.map(loc => ({
        label: loc.location_name,
        value: loc.location_name, // Using name as ID per API requirement
    })) || [];

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

    const handleCheckIn = async () => {
        if (!selectedLocation) {
            Toast.show({ type: 'error', text1: 'Please select a location' });
            return;
        }
        if (!image) {
            Toast.show({ type: 'error', text1: 'Please take a selfie' });
            return;
        }

        try {
            setIsSubmitting(true);
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                Toast.show({ type: 'error', text1: 'Location permission required' });
                return;
            }

            const locationStr = await getCurrentLocation();
            if (!locationStr) {
                Toast.show({ type: 'error', text1: 'Unable to fetch location' });
                return;
            }

            const res = await checkIn({
                activity_location: selectedLocation,
                current_location: locationStr,
                image: image,
            }).unwrap();

            if (res.message.success) {
                Toast.show({ type: 'success', text1: 'Checked in successfully' });
                navigation.goBack();
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

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.submitBtn, (isSubmitting || isLocationsLoading) && { opacity: 0.7 }]}
                        onPress={handleCheckIn}
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
        marginTop: 10,
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
