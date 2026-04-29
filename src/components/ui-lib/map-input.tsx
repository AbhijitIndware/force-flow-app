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
import { getCurrentLocation } from '../../utils/utils';

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

  const handleLocationFetch = async () => {
    try {
      setLoading(true);
      const loc = await getCurrentLocation();
      if (loc) {
        onChangeText(loc);
      }
    } catch (err) {
      console.log('Error fetching location:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.inputWrapper, { marginBottom }]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.helper}>
          Tap icon to fetch location
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${label}`}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          editable={!disabled}
        />
        <TouchableOpacity
          onPress={handleLocationFetch}
          disabled={loading}
          style={styles.iconWrapper}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : (
            <MapPin size={20} color={Colors.black} />
          )}
        </TouchableOpacity>
      </View>
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
  helper: {
    fontSize: 10,
    color: Colors.error,
    fontFamily: Fonts.regular,
  },
});

export default MapReusableInput;
