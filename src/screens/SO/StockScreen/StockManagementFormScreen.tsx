import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    FlatList,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { flexCol, flexRow, itemsCenter } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useGetStockItemsQuery, useCreateStockBalanceMutation, useGetStoreStockStatusQuery } from '../../../features/base/base-api';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { Check, ClipboardList, Package, Save } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<
    SoAppStackParamList,
    'StockManagementFormScreen'
>;

type Props = {
    navigation: NavigationProp;
    route: {
        params: {
            store: string;
            storeName: string;
        };
    };
};

interface StockCount {
    item_code: string;
    quantity: string;
    item_name: string;
}

const StockManagementFormScreen = ({ navigation, route }: Props) => {
    const { store, storeName } = route.params;
    const [counts, setCounts] = useState<Record<string, string>>({});

    const { data: stockItemsData, isLoading: isItemsLoading } = useGetStoreStockStatusQuery({ store });
    const [createStockBalance, { isLoading: isSubmitting }] = useCreateStockBalanceMutation();

    const handleCountChange = (itemCode: string, value: string) => {
        // Only allow numeric input
        const cleanValue = value.replace(/[^0-9]/g, '');
        setCounts(prev => ({
            ...prev,
            [itemCode]: cleanValue,
        }));
    };

    const handleSubmit = async () => {
        try {
            const itemsToSubmit = Object.entries(counts)
                .filter(([_, qty]) => qty !== '')
                .map(([code, qty]) => ({
                    item_code: code,
                    quantity: parseInt(qty, 10),
                    batch: "", // Using empty batch as not provided in get_items
                }));

            if (itemsToSubmit.length === 0) {
                Toast.show({
                    type: 'error',
                    text1: 'No counts entered',
                    text2: 'Please enter at least one item count',
                });
                return;
            }

            const response = await createStockBalance({
                store,
                items: JSON.stringify(itemsToSubmit),
            }).unwrap();

            if (response.message) {
                Toast.show({
                    type: 'success',
                    text1: 'Stock updated successfully',
                });
                navigation.goBack();
            }
        } catch (error: any) {
            console.error('Stock Update Error:', error);
            Alert.alert('Error', error?.data?.message || 'Failed to update stock. Please try again.');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.item_name}</Text>
                <Text style={styles.itemCode}>{item.item_code}</Text>
                <View style={[flexRow, itemsCenter, { marginTop: 4 }]}>
                    <Text style={styles.stockLabel}>ERP Stock: </Text>
                    <Text style={styles.stockValue}>{item.current_stock || 0}</Text>
                </View>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0"
                    value={counts[item.item_code] || ''}
                    onChangeText={(val) => handleCountChange(item.item_code, val)}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.white }]}>
            <PageHeader title="Physical Count" navigation={() => navigation.goBack()} />

            <View style={styles.headerInfo}>
                <Package size={20} color={Colors.orange} />
                <Text style={styles.storeName}>{storeName}</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {isItemsLoading ? (
                    <LoadingScreen />
                ) : (
                    <FlatList
                        data={stockItemsData?.message?.data || []}
                        keyExtractor={(item) => item.item_code}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                        ListHeaderComponent={
                            <View style={styles.listHeader}>
                                <ClipboardList size={18} color={Colors.gray} />
                                <Text style={styles.listHeaderText}>Enter current physical shelf counts</Text>
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No items found for stock update</Text>
                            </View>
                        }
                    />
                )}
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Save size={20} color={Colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? 'Submitting...' : 'Submit Count'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default StockManagementFormScreen;

const styles = StyleSheet.create({
    headerInfo: {
        padding: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FFF9F2',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FFEBCB',
    },
    storeName: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.sm,
        color: Colors.darkButton,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    listHeaderText: {
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: Colors.gray,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemName: {
        fontFamily: Fonts.medium,
        fontSize: Size.sm,
        color: Colors.darkButton,
    },
    itemCode: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: Colors.gray,
    },
    stockLabel: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: Colors.gray,
    },
    stockValue: {
        fontFamily: Fonts.medium,
        fontSize: 10,
        color: Colors.orange,
    },
    inputContainer: {
        width: 80,
        height: 40,
        backgroundColor: '#F8F9FB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E4E9',
        justifyContent: 'center',
    },
    input: {
        paddingHorizontal: 8,
        fontFamily: Fonts.semiBold,
        fontSize: Size.sm,
        color: Colors.darkButton,
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
        backgroundColor: Colors.white,
    },
    submitButton: {
        backgroundColor: Colors.darkButton,
        borderRadius: 12,
        height: 52,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.sm,
        color: Colors.white,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontFamily: Fonts.regular,
        fontSize: Size.sm,
        color: Colors.gray,
    },
});