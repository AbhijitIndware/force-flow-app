import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import {
  getCurrentPositionWithAccuracy,
  LOW_LOCATION_ACCURACY,
} from '../../utils/utils';

import { Colors } from '../../utils/colors';
import { Fonts } from '../../constants';
import { Size } from '../../utils/fontSize';

interface DistributorInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string | false;
  keyboardType?: TextInputProps['keyboardType'];
  disabled?: boolean;
  marginBottom?: number;
}

const MapReusableInput: React.FC<DistributorInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType = 'default',
  disabled = false,
  marginBottom = 16,
}) => {
  const [loading, setLoading] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const isLowAccuracy = accuracy !== null && accuracy > LOW_LOCATION_ACCURACY;

  const handleLocationFetch = async () => {
    try {
      setLoading(true);
      const { latitude, longitude, accuracy: acc } =
        await getCurrentPositionWithAccuracy();
      onChangeText(`${latitude},${longitude}`);
      setAccuracy(acc);
      if (acc > LOW_LOCATION_ACCURACY) {
        Toast.show({
          type: 'error',
          text1: `Weak GPS signal (±${Math.round(acc)} m)`,
          text2: 'Move near the store entrance and tap the pin again.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to fetch location',
        text2: err?.message ?? 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.inputWrapper, { marginBottom }]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.helper}>
          {loading
            ? 'Getting accurate location...'
            : 'Tap icon to fetch location'}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Tap the pin to fetch ${label.toLowerCase()}`}
          value={value}
          onBlur={onBlur}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          // Location must come from GPS, not typed, so check-in distance is reliable.
          editable={false}
        />
        <TouchableOpacity
          onPress={handleLocationFetch}
          disabled={loading || disabled}
          style={styles.iconWrapper}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : (
            <MapPin size={20} color={Colors.black} />
          )}
        </TouchableOpacity>
      </View>
      {accuracy !== null && !loading && (
        <Text style={[styles.accuracy, isLowAccuracy && styles.accuracyLow]}>
          {isLowAccuracy
            ? `Low accuracy (±${Math.round(accuracy)} m) — tap the pin again near the store`
            : `Accuracy ±${Math.round(accuracy)} m`}
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 16 },
  label: {
    fontSize: Size.xs,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecececff',
    paddingHorizontal: 8,
    height: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
  },
  iconWrapper: {
    padding: 8,
  },
  error: { fontSize: 12, color: Colors.error, marginTop: 4 },
  accuracy: {
    fontSize: 11,
    color: '#15803d',
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  accuracyLow: { color: '#B45309' },
  helper: {
    fontSize: 10,
    color: Colors.error,
    fontFamily: Fonts.regular,
  },
});

export default MapReusableInput;
