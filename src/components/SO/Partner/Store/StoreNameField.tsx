import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import ReusableInput from '../../../ui-lib/reuseable-input';
import { Fonts } from '../../../../constants';
import { useGetStoresByLocationQuery } from '../../../../features/base/base-api';
import { MapPin, Plus, ChevronDown } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native-paper';

interface StoreNameFieldProps {
    mapLocation: string; // expected format: "latitude,longitude" e.g. "26.1445,91.7362"
    value: string;
    isEdit?: boolean;
    isTyping: boolean;
    isCheckingName: boolean;
    storeNameTaken: boolean;
    nameCheckData: any;
    touched: any;
    errors: any;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    setFieldValue: (field: string, value: any) => void;
    marginBottom?: number;
}

const StoreNameField: React.FC<StoreNameFieldProps> = ({
    mapLocation,
    value,
    isEdit,
    isTyping,
    isCheckingName,
    storeNameTaken,
    nameCheckData,
    touched,
    errors,
    onChangeText,
    onBlur,
    setFieldValue,
    marginBottom,
}) => {
    const [mode, setMode] = useState<'suggest' | 'manual'>('suggest');
    const [showDropdown, setShowDropdown] = useState(false);
    const [inputEnabled, setInputEnabled] = useState(false);

    const hasLocation = mapLocation?.trim().length > 0;

    // ── Parse "lat,lng" string into numbers ──
    const parsedCoords = useMemo(() => {
        if (!hasLocation) return null;
        const [lat, lng] = mapLocation.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) return null;
        return { latitude: lat, longitude: lng };
    }, [mapLocation, hasLocation]);

    // ── Fetch nearby stores when location is set ──
    const { data: nearbyData, isFetching: isFetchingNearby } =
        useGetStoresByLocationQuery(
            parsedCoords ?? { latitude: 0, longitude: 0 },
            { skip: !parsedCoords || !!isEdit },
        );

    const nearbyStores = nearbyData?.message?.stores ?? [];

    // Auto switch to manual if no suggestions — but keep inputEnabled false
    useEffect(() => {
        if (!isFetchingNearby && nearbyStores.length === 0 && hasLocation) {
            setMode('manual');
            setInputEnabled(false); // start disabled; user must tap to enable
        }
    }, [isFetchingNearby, nearbyStores.length, hasLocation]);

    const nameError =
        (touched.store_name && errors.store_name) ||
        (!isEdit && value.trim().length >= 3
            ? isTyping || isCheckingName
                ? 'Checking availability...'
                : storeNameTaken
                    ? nameCheckData?.message?.message ?? 'This store name is already taken.'
                    : undefined
            : undefined);

    // ── If editing or no location yet → plain input ──
    if (isEdit || !hasLocation) {
        return (
            <ReusableInput
                label="Store Name"
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                error={nameError}
                disabled={!hasLocation}
                marginBottom={marginBottom}
            />
        );
    }

    return (
        <View style={sfStyles.wrapper}>
            <Text style={sfStyles.label}>Store Name</Text>

            {/* Mode toggle — only shown when there are nearby stores */}
            {nearbyStores.length > 0 && (
                <View style={sfStyles.modeRow}>
                    <TouchableOpacity
                        style={[sfStyles.modeChip, mode === 'suggest' && sfStyles.modeChipActive]}
                        onPress={() => { setMode('suggest'); setFieldValue('store_name', ''); }}
                    >
                        <MapPin size={11} color={mode === 'suggest' ? '#534AB7' : '#828282'} strokeWidth={2} />
                        <Text style={[sfStyles.modeChipText, mode === 'suggest' && sfStyles.modeChipTextActive]}>
                            Nearby
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[sfStyles.modeChip, mode === 'manual' && sfStyles.modeChipActive]}
                        onPress={() => { setMode('manual'); setFieldValue('store_name', ''); setInputEnabled(true); }}
                    >
                        <Plus size={11} color={mode === 'manual' ? '#534AB7' : '#828282'} strokeWidth={2} />
                        <Text style={[sfStyles.modeChipText, mode === 'manual' && sfStyles.modeChipTextActive]}>
                            Add New
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Suggest mode: dropdown */}
            {mode === 'suggest' ? (
                <View style={{ marginBottom: 10 }}>
                    {isFetchingNearby ? (
                        <View style={sfStyles.loadingBox}>
                            <ActivityIndicator size="small" color="#534AB7" />
                            <Text style={sfStyles.loadingText}>Finding nearby stores...</Text>
                        </View>
                    ) : nearbyStores.length === 0 ? (
                        <View style={sfStyles.emptyBox}>
                            <Text style={sfStyles.emptyText}>No nearby stores found.</Text>
                            <TouchableOpacity onPress={() => setMode('manual')}>
                                <Text style={sfStyles.addNewLink}>+ Add new store name</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[sfStyles.dropdownTrigger, showDropdown && sfStyles.dropdownTriggerOpen]}
                                onPress={() => setShowDropdown(v => !v)}
                            >
                                <Text
                                    style={value ? sfStyles.dropdownValue : sfStyles.dropdownPlaceholder}
                                    numberOfLines={1}
                                >
                                    {value || 'Select a nearby store'}
                                </Text>
                                <ChevronDown size={16} color="#828282" strokeWidth={2} />
                            </TouchableOpacity>

                            {showDropdown && (
                                <View style={sfStyles.dropdownList}>
                                    {nearbyStores.map((s, i) => (
                                        <TouchableOpacity
                                            key={s.name ?? i}
                                            style={[
                                                sfStyles.dropdownItem,
                                                i < nearbyStores.length - 1 && sfStyles.dropdownItemBorder,
                                                value === s.store_name && sfStyles.dropdownItemActive,
                                            ]}
                                            onPress={() => {
                                                setFieldValue('store_name', s.store_name);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <MapPin
                                                size={12}
                                                color={value === s.store_name ? '#534AB7' : '#828282'}
                                                strokeWidth={2}
                                            />
                                            <Text style={[
                                                sfStyles.dropdownItemText,
                                                value === s.store_name && sfStyles.dropdownItemTextActive,
                                            ]}>
                                                {s.store_name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Add new option at bottom of list */}
                                    <TouchableOpacity
                                        style={[sfStyles.dropdownItem, sfStyles.addNewRow]}
                                        onPress={() => {
                                            setFieldValue('store_name', '');
                                            setShowDropdown(false);
                                            setMode('manual');
                                            setInputEnabled(true);
                                        }}
                                    >
                                        <Plus size={12} color="#0F6E56" strokeWidth={2.5} />
                                        <Text style={sfStyles.addNewRowText}>Add new store name</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </View>
            ) : (
                <View>
                    {nearbyStores.length === 0 && (
                        <View style={sfStyles.noStoresBanner}>
                            <MapPin size={13} color="#828282" strokeWidth={2} />
                            <Text style={sfStyles.noStoresText}>No stores found near this location</Text>
                        </View>
                    )}

                    <View style={sfStyles.inputWrapper}>
                        <ReusableInput
                            label=""
                            value={value}
                            onChangeText={onChangeText}
                            onBlur={onBlur}
                            error={inputEnabled ? nameError : undefined} disabled={!hasLocation}       // ← try this
                            // disabled={!inputEnabled}       // ← or this, whichever your component uses
                            placeholder={inputEnabled ? 'Enter store name' : 'Tap to enter store name'}
                            marginBottom={marginBottom}
                        />
                    </View>
                </View>
            )}

            {/* Validation error for suggest mode */}
            {mode === 'suggest' && touched.store_name && errors.store_name && (
                <Text style={sfStyles.errorText}>{errors.store_name}</Text>
            )}
        </View>
    );
};

export default StoreNameField;

// ── StoreNameField styles ──
const sfStyles = StyleSheet.create({
    wrapper: { marginBottom: 0 },
    label: {
        fontSize: 12,
        color: '#1A1A1A',
        fontFamily: Fonts.medium,
        marginBottom: 6,
    },
    modeRow: {
        flexDirection: 'row',
        gap: 8,
        // marginBottom: 10,
    },
    modeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#F5F5F7',
    },
    modeChipActive: {
        backgroundColor: 'rgba(83,74,183,0.1)',
        borderColor: '#534AB7',
    },
    modeChipText: { fontSize: 12, color: '#828282', fontFamily: Fonts.medium },
    modeChipTextActive: { color: '#534AB7', fontWeight: '700' },

    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 14,
        height: 50,
        marginTop: 10
    },
    dropdownTriggerOpen: {
        borderColor: '#534AB7',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    dropdownPlaceholder: { fontSize: 14, color: '#828282', fontFamily: Fonts.regular },
    dropdownValue: { fontSize: 14, color: '#1A1A1A', fontFamily: Fonts.medium, flex: 1 },

    dropdownList: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#534AB7',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    dropdownItemBorder: { borderBottomWidth: 0.5, borderBottomColor: '#F0F2F6' },
    dropdownItemActive: { backgroundColor: 'rgba(83,74,183,0.06)' },
    dropdownItemText: { fontSize: 13, color: '#1A1A1A', fontFamily: Fonts.medium },
    dropdownItemTextActive: { color: '#534AB7', fontWeight: '700' },

    addNewRow: { backgroundColor: '#F0FDF9', borderTopWidth: 0.5, borderTopColor: '#E0E0E0' },
    addNewRowText: { fontSize: 13, color: '#0F6E56', fontFamily: Fonts.semiBold, fontWeight: '700' },
    addNewLink: { fontSize: 13, color: '#534AB7', fontFamily: Fonts.semiBold, marginTop: 6 },

    loadingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        backgroundColor: '#F5F5F7',
        borderRadius: 10,
    },
    loadingText: { fontSize: 13, color: '#828282', fontFamily: Fonts.medium },

    emptyBox: { padding: 14, backgroundColor: '#F5F5F7', borderRadius: 10 },
    emptyText: { fontSize: 13, color: '#828282', fontFamily: Fonts.medium },

    errorText: { fontSize: 11, color: '#D31010', marginTop: 4, fontFamily: Fonts.medium },

    // ── No-stores & disabled-input styles ──
    noStoresBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F5F5F7',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: -25,
    },
    noStoresText: {
        fontSize: 12,
        color: '#828282',
        fontFamily: Fonts.medium,
    },
    inputWrapper: {
        position: 'relative',
    },
    inputDisabled: {
        backgroundColor: '#F5F5F7',
        color: '#AAAAAA',
    },
    disabledHint: {
        position: 'absolute',
        left: 2,
    },
    disabledHintText: {
        fontSize: 11,
        color: '#AAAAAA',
        fontFamily: Fonts.regular,
        fontStyle: 'italic',
    }, disabledOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 10,
        backgroundColor: 'rgba(245,245,247,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});