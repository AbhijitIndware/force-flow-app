import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { useCreateActivityLocationMutation } from '../../../features/base/base-api';
import { useGetLocationByLatLongQuery } from '../../../features/dropdown/dropdown-api';
import {
  getCurrentLocation,
  requestLocationPermission,
} from '../../../utils/utils';
import Toast from 'react-native-toast-message';
import { Camera, MapPin, Navigation, Save } from 'lucide-react-native';
import { launchCamera } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { getUserFacingError, getSafeServerMessage } from '../../../utils/errorMessage';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddActivityLocationScreen'
>;

const AddActivityLocationScreen = ({
  navigation,
}: {
  navigation: NavigationProp;
}) => {
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationImage, setLocationImage] = useState<{
    mime: string;
    data: string;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [createLocation, { isLoading }] = useCreateActivityLocationMutation();
  const { data: locationData } = useGetLocationByLatLongQuery(
    {
      latitude: coordinates?.latitude.toString() || '',
      longitude: coordinates?.longitude.toString() || '',
    },
    { skip: !coordinates },
  );


  const handleGetLocation = async () => {
    try {
      setIsLocating(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Toast.show({ type: 'error', text1: 'Location permission denied' });
        return;
      }

      const location = await getCurrentLocation();
      if (location) {
        const [lat, lng] = location.split(',').map(Number);
        setCoordinates({ latitude: lat, longitude: lng });
        Toast.show({ type: 'success', text1: 'Location captured' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to get location' });
    } finally {
      setIsLocating(false);
    }
  };

  const handleTakeLocationImage = async () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        includeBase64: true,
        saveToPhotos: false,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Toast.show({ type: 'error', text1: 'Camera Error' });
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const photo = response.assets[0];
          if (photo.base64 && photo.type) {
            setLocationImage({
              mime: photo.type,
              data: photo.base64,
            });
          }
        }
      },
    );
  };

  const handleSubmit = async () => {
    if (!locationName.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter location name' });
      return;
    }
    if (!coordinates) {
      Toast.show({ type: 'error', text1: 'Please capture coordinates' });
      return;
    }

    try {
      const res = await createLocation({
        location_name: locationName,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address: address,
        location_image: locationImage ? locationImage : undefined,
      }).unwrap();

      if (res.message.success) {
        Toast.show({ type: 'success', text1: 'Location created successfully' });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: getSafeServerMessage(res?.message?.message) ?? 'Failed to create location',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(error, 'Failed to create location'),
      });
    }
  };


  useEffect(() => {
    if (locationData?.message?.raw?.display_name) {
      setAddress(locationData.message.raw.display_name);
    }
  }, [locationData]);

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Create Activity Location"
        navigation={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Regional Office, City Event"
                value={locationName}
                placeholderTextColor={Colors.gray}
                onChangeText={setLocationName}
              />
            </View>

            <View style={styles.coordinatesCard}>
              <View style={styles.cardHeader}>
                <MapPin size={20} color={Colors.darkButton} />
                <Text style={styles.cardTitle}>Coordinates</Text>
              </View>

              {coordinates ? (
                <View style={styles.coordsRow}>
                  <View style={styles.coordBox}>
                    <Text style={styles.coordLabel}>Latitude</Text>
                    <Text style={styles.coordValue}>
                      {coordinates.latitude.toFixed(6)}
                    </Text>
                  </View>
                  <View style={styles.coordBox}>
                    <Text style={styles.coordLabel}>Longitude</Text>
                    <Text style={styles.coordValue}>
                      {coordinates.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noCoords}>No coordinates captured yet</Text>
              )}

              <TouchableOpacity
                style={styles.locationBtn}
                onPress={handleGetLocation}
                disabled={isLocating}>
                {isLocating ? (
                  <ActivityIndicator color={Colors.darkButton} />
                ) : (
                  <>
                    <Navigation
                      size={18}
                      color={Colors.darkButton}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.locationBtnText}>
                      Capture Current Location
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address / Landmark</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter address details"
                placeholderTextColor={Colors.gray}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Photo (Optional)</Text>
              <Text style={styles.sectionSubtitle}>
                Take a photo of this location for records
              </Text>

              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handleTakeLocationImage}>
                {locationImage ? (
                  <Image
                    source={{ uri: `data:${locationImage.mime};base64,${locationImage.data}` }}
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
            style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Save size={20} color={Colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitText}>Create Location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddActivityLocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  scrollContent: {
    padding: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
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
  label: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  coordinatesCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  coordLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.gray,
    marginBottom: 2,
  },
  coordValue: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  noCoords: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.gray,
    textAlign: 'center',
    marginVertical: 10,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.darkButton,
    borderStyle: 'dashed',
  },
  locationBtnText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
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
