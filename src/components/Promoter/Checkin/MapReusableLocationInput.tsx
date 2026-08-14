import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {MapPin, X} from 'lucide-react-native';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {getCurrentLocation} from '../../../utils/utils';
import {skipToken} from '@reduxjs/toolkit/query/react';
import {useGetLocationByLatLongQuery} from '../../../features/dropdown/dropdown-api';
import ReusableInput from '../../ui-lib/reuseable-input';

interface Props {
  label?: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  setFieldValue: (field: string, value: any) => void;
  error?: string | false;
  hideLabel?: boolean;
}

const MapReusableLocationInput: React.FC<Props> = ({
  label = 'Location',
  latitude,
  longitude,
  address,
  setFieldValue,
  error,
  hideLabel = false,
}) => {
  const [loading, setLoading] = useState(false);

  // API call to get address from lat/lng
  const {data: locationData, isFetching} = useGetLocationByLatLongQuery(
    latitude && longitude
      ? {latitude: String(latitude), longitude: String(longitude)}
      : skipToken,
  );

  // Set address automatically when API returns
  useEffect(() => {
    if (locationData?.message?.address) {
      setFieldValue('address', locationData.message.address);
    }
  }, [locationData?.message?.address]);

  // Fetch current lat/lng
  const fetchLocation = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      if (location) {
        const [lat, lng] = location.split(',').map(Number);
        setFieldValue('latitude', lat);
        setFieldValue('longitude', lng);
        // Address will be set automatically from API
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Label */}
      {!hideLabel ? <Text style={styles.label}>{label}</Text> : null}

      {/* Fetch Location Card */}
      <View style={[styles.locationCard, hideLabel && styles.locationCardNoLabel]}>
        {/* Left: Map Icon */}
        <MapPin size={18} color={Colors.white} style={{marginRight: 10}} />

        {/* Center: Button / Text */}
        <TouchableOpacity
          style={{flex: 1}}
          onPress={fetchLocation}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.locationButtonText}>
              {latitude && longitude
                ? 'Update Location'
                : 'Fetch Current Location'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Right: Remove button */}
        {(latitude || longitude || address) && !loading ? (
          <TouchableOpacity
            onPress={() => {
              setFieldValue('latitude', null);
              setFieldValue('longitude', null);
              setFieldValue('address', '');
            }}
            style={styles.removeButton}>
            <X size={12} color={Colors.white} />
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Latitude & Longitude side by side */}
      <View style={styles.row}>
        <View style={styles.col}>
          <ReusableInput
            label="Latitude"
            value={latitude ? String(latitude) : ''}
            onChangeText={() => {}}
            onBlur={() => {}}
            disabled={true}
          />
        </View>
        <View style={styles.col}>
          <ReusableInput
            label="Longitude"
            value={longitude ? String(longitude) : ''}
            onChangeText={() => {}}
            onBlur={() => {}}
            disabled={true}
          />
        </View>
      </View>

      {/* Address */}
      <ReusableInput
        label="Address"
        value={address}
        onChangeText={text => setFieldValue('address', text)}
        onBlur={() => {}}
        error={error}
        disabled={isFetching}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {marginBottom: 0},
  label: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    marginBottom: 6,
    color: Colors.black,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blue,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 10,
    gap: 6,
  },
  locationButtonText: {
    color: '#fff',
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  locationCardNoLabel: {
    marginTop: 10,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.denger,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: Size.xs,
    fontFamily: Fonts.medium,
  },
});

export default MapReusableLocationInput;
