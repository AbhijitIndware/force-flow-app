import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import { flexCol, flexRow, itemsCenter } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useCreateStockBalanceMutation, useGetStoreStockStatusQuery } from '../../../features/base/base-api';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { ClipboardList, Package, Save, Trash2, Plus } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import ItemDropdownField from '../../../components/SO/Stock/ItemDropdownField';

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

interface StockItemEntry {
    itemCode: string;
    quantity: string;
    itemName?: string;
}

const StockManagementFormScreen = ({ navigation, route }: Props) => {
    const { store, storeName } = route.params;
    const [items, setItems] = useState<StockItemEntry[]>([{ itemCode: '', quantity: '' }]);

    const { data: stockStatusData } = useGetStoreStockStatusQuery({ store });
    const [createStockBalance, { isLoading: isSubmitting }] = useCreateStockBalanceMutation();

    const handleAddItem = () => {
        setItems(prev => [...prev, { itemCode: '', quantity: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) {
            setItems([{ itemCode: '', quantity: '' }]);
            return;
        }
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateItem = (index: number, field: keyof StockItemEntry, value: string) => {
        const updated = [...items];
        if (field === 'quantity') {
            updated[index][field] = value.replace(/[^0-9]/g, '');
        } else {
            updated[index][field] = value;
        }
        setItems(updated);
    };

    const handleSubmit = async () => {
        try {
            const itemsToSubmit = items
                .filter(item => item.itemCode && item.quantity !== '')
                .map(item => ({
                    item_code: item.itemCode,
                    quantity: parseInt(item.quantity, 10),
                    batch: "",
                }));

            if (itemsToSubmit.length === 0) {
                Toast.show({
                    type: 'error',
                    text1: 'No items entered',
                    text2: 'Please select an item and enter quantity',
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

    return (
        <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.white }]}>
            <PageHeader title={`${storeName}`} navigation={() => navigation.goBack()} />

            {/* <View style={styles.headerInfo}>
                <Package size={20} color={Colors.orange} />
                <Text style={styles.storeName}>{storeName}</Text>
            </View> */}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                    <View style={styles.listHeader}>
                        <ClipboardList size={18} color={Colors.gray} />
                        <Text style={styles.listHeaderText}>Add items and enter stock counts</Text>
                    </View>

                    {items.map((item, index) => {
                        const stockInfo = stockStatusData?.message?.data?.find(s => s.item_name === item.itemCode);

                        return (
                            <View key={index} style={styles.itemRow}>
                                <View style={[flexRow, itemsCenter, { justifyContent: 'space-between', marginBottom: 10 }]}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <ItemDropdownField
                                            label={`Item ${index + 1}`}
                                            field={`item_${index}`}
                                            value={item.itemCode}
                                            store={store}
                                            onChange={(val) => handleUpdateItem(index, 'itemCode', val)}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveItem(index)}
                                        style={styles.removeBtn}
                                    >
                                        <Trash2 size={18} color={Colors.denger} />
                                    </TouchableOpacity>
                                </View>

                                {stockInfo && (
                                    <View style={styles.stockDetailsRow}>
                                        <View style={styles.stockInfoItem}>
                                            <Text style={styles.stockMiniLabel}>Opening: <Text style={styles.stockMiniValue}>{stockInfo.opening_stock}</Text></Text>
                                        </View>
                                        <View style={styles.stockInfoItem}>
                                            <Text style={styles.stockMiniLabel}>Current: <Text style={styles.stockMiniValue}>{stockInfo.current_stock}</Text></Text>
                                        </View>
                                        <View style={styles.stockInfoItem}>
                                            <Text style={styles.stockMiniLabel}>MTD Territory: <Text style={styles.stockMiniValue}>{stockInfo.mtd_territory}</Text></Text>
                                        </View>
                                        <View style={styles.stockInfoItem}>
                                            <Text style={styles.stockMiniLabel}>New: <Text style={styles.stockMiniValue}>{stockInfo.new_orders ?? '—'}</Text></Text>
                                        </View>
                                    </View>
                                )}

                                <View style={[flexRow, itemsCenter, { justifyContent: 'flex-start', marginTop: 10, gap: 12 }]}>
                                    <Text style={styles.countLabel}>Stock Count:</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={Colors.gray}
                                            value={item.quantity}
                                            onChangeText={(val) => handleUpdateItem(index, 'quantity', val)}
                                        />
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        onPress={handleAddItem}
                        style={styles.addButton}
                    >
                        <Plus size={18} color={Colors.white} />
                        <Text style={styles.addButtonText}>Add Item</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Save size={20} color={Colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? 'Submitting...' : 'Submit Stock'}
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
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#EEF0F4',
        elevation: 1,
    },
    countLabel: {
        fontFamily: Fonts.medium,
        fontSize: Size.xs,
        color: Colors.darkButton,
    },
    inputContainer: {
        width: 80,
        // height: 45,
        backgroundColor: '#F9FAFB',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E4E9',
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        paddingHorizontal: 8,
        fontFamily: Fonts.bold,
        fontSize: Size.xs,
        color: Colors.darkButton,
        // textAlign: 'center',
        height: 45
    },
    removeBtn: {
        padding: 4,
    },
    stockDetailsRow: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 6,
        padding: 8,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    stockInfoItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    stockMiniLabel: {
        fontFamily: Fonts.regular,
        fontSize: 9,
        color: '#64748B',
    },
    stockMiniValue: {
        fontFamily: Fonts.semiBold,
        color: Colors.darkButton,
        fontSize: Size.xs
    },
    addButton: {
        backgroundColor: Colors.orange,
        paddingVertical: 12,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    addButtonText: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.xs,
        color: Colors.white,
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
});