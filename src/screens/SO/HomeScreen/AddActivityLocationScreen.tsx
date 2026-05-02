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
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { useCreateActivityLocationMutation } from '../../../features/base/base-api';
import { useGetLocationByLatLongQuery } from '../../../features/dropdown/dropdown-api';
import { getCurrentLocation, requestLocationPermission } from '../../../utils/utils';
import Toast from 'react-native-toast-message';
import { MapPin, Navigation, Save } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';

type NavigationProp = NativeStackNavigationProp<SoAppStackParamList, 'AddActivityLocationScreen'>;

const LOCATION_TYPES = [
  { label: 'Office Visit', value: 'Office Visit' },
  { label: 'Miscellaneous Visit', value: 'Miscellaneous Visit' },
  { label: 'Distributor Point', value: 'Distributor Point' },
  { label: 'Key Account', value: 'Key Account' },
  { label: 'New Account Opening', value: 'New Account Opening' },
  { label: 'Distributor Opening', value: 'Distributor Opening' },
];

// Location types that require an additional text input
const TYPES_WITH_TEXT_INPUT = ['Office Visit', 'Miscellaneous Visit', 'Key Account'];

const AddActivityLocationScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const [locationName, setLocationName] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);


  const showDetailInput = TYPES_WITH_TEXT_INPUT.includes(locationName);

  const [createLocation, { isLoading }] = useCreateActivityLocationMutation();

  const { data: locationData } = useGetLocationByLatLongQuery(
    {
      latitude: coordinates?.latitude.toString() || '',
      longitude: coordinates?.longitude.toString() || '',
    },
    { skip: !coordinates }
  );

  useEffect(() => {
    if (locationData?.message?.raw?.display_name) {
      setAddress(locationData.message.raw.display_name);
    }
  }, [locationData]);

  // Clear detail input when switching to a type that doesn't need it
  useEffect(() => {
    if (!showDetailInput) {
      setLocationDetail('');
    }
  }, [locationName]);

  const filteredLocationTypes = LOCATION_TYPES.filter((item) =>
    item.label.toLowerCase().includes(locationSearch.toLowerCase())
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

  const handleSubmit = async () => {
    if (!locationName.trim()) {
      Toast.show({ type: 'error', text1: 'Please select a location name' });
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
      }).unwrap();

      if (res.message.success) {
        Toast.show({ type: 'success', text1: 'Location created successfully' });
        navigation.goBack();
      }
    } catch (error: any) {
      console.log('🚀 ~ handleSubmit ~ error:', error);
      Toast.show({
        type: 'error',
        text1: error?.data?.message || 'Failed to create location',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Add Activity Location" navigation={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>

            {/* Location Name Dropdown */}
            <ReusableDropdown
              label="Location Type"
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
                <Text style={styles.label}>{locationName} Details</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter details for ${locationName}`}
                  placeholderTextColor={Colors.gray}
                  value={locationDetail}
                  onChangeText={setLocationDetail}
                />
              </View>
            )}

            {/* Coordinates Card */}
            <View style={styles.coordinatesCard}>
              <View style={styles.cardHeader}>
                <MapPin size={20} color={Colors.darkButton} />
                <Text style={styles.cardTitle}>Coordinates</Text>
              </View>

              {coordinates ? (
                <View style={styles.coordsRow}>
                  <View style={styles.coordBox}>
                    <Text style={styles.coordLabel}>Latitude</Text>
                    <Text style={styles.coordValue}>{coordinates.latitude.toFixed(6)}</Text>
                  </View>
                  <View style={styles.coordBox}>
                    <Text style={styles.coordLabel}>Longitude</Text>
                    <Text style={styles.coordValue}>{coordinates.longitude.toFixed(6)}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noCoords}>No coordinates captured yet</Text>
              )}

              <TouchableOpacity
                style={styles.locationBtn}
                onPress={handleGetLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator color={Colors.darkButton} />
                ) : (
                  <>
                    <Navigation size={18} color={Colors.darkButton} style={{ marginRight: 8 }} />
                    <Text style={styles.locationBtnText}>Capture Current Location</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Address */}
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

          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Save size={20} color={Colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitText}>Add Location</Text>
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
    gap: 5,
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