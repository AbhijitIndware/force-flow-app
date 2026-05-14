import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { Fonts } from '../../../constants';
import { Colors } from '../../../utils/colors';
import { Size } from '../../../utils/fontSize';
import ReusableDropdownv2 from '../../ui-lib/resusable-dropdown-v2';

const { width } = Dimensions.get('window');

const MONTHS = moment.months().map((label, i) => ({
    label,
    short: moment().month(i).format('MMM'),
    value: i + 1,
}));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

interface Props {
    selectedMonth: number;
    selectedYear: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    statuses?: string[];
}

const VisibilityHeader: React.FC<Props> = ({
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
    selectedStatus,
    onStatusChange,
    statuses = ['', 'Draft', 'Submitted', 'Approved', 'Rejected', 'Cancelled'],
}) => {
    const [showMonthModal, setShowMonthModal] = React.useState(false);
    const [showYearModal, setShowYearModal] = React.useState(false);

    const selectedMonthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || '';

    return (
        <>
            <View style={styles.header}>
                <View style={styles.row1}>
                    {/* Year + Month pills */}
                    {/* <View style={styles.filterRow}> */}
                    <TouchableOpacity style={styles.pill} onPress={() => setShowYearModal(true)} activeOpacity={0.7}>
                        <Text style={styles.pillText}>{selectedYear}</Text>
                        <Ionicons name="chevron-down" size={11} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.pill, styles.pillActive]} onPress={() => setShowMonthModal(true)} activeOpacity={0.7}>
                        <Text style={[styles.pillText, styles.pillTextActive]}>{selectedMonthLabel}</Text>
                        <Ionicons name="chevron-down" size={11} color={Colors.darkButton} />
                    </TouchableOpacity>
                    {/* </View> */}

                    {/* Status Filter Dropdown */}
                    <View style={styles.statusDropdownWrap}>
                        <ReusableDropdownv2
                            label="Status"
                            field="status"
                            value={selectedStatus}
                            data={statuses.map(s => ({
                                label: s || 'All',
                                value: s,
                            }))}
                            onChange={(val: string) => onStatusChange(val)}
                            height={32}
                            marginBottom={0}
                            textSize={12}
                            labelStyle={{ display: 'none' }}
                        />
                    </View>
                </View>
            </View>

            {/* Month Modal */}
            <Modal visible={showMonthModal} transparent animationType="slide" onRequestClose={() => setShowMonthModal(false)}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMonthModal(false)}>
                    <View style={styles.sheet}>
                        <View style={styles.handle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Select Month</Text>
                            <TouchableOpacity onPress={() => setShowMonthModal(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.grid}>
                            {MONTHS.map(m => {
                                const active = selectedMonth === m.value;
                                return (
                                    <TouchableOpacity
                                        key={m.value}
                                        style={[styles.gridItem, active && styles.gridItemActive]}
                                        onPress={() => { onMonthChange(m.value); setShowMonthModal(false); }}>
                                        <Text style={[styles.gridText, active && styles.gridTextActive]}>{m.short}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Year Modal */}
            <Modal visible={showYearModal} transparent animationType="slide" onRequestClose={() => setShowYearModal(false)}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowYearModal(false)}>
                    <View style={styles.sheet}>
                        <View style={styles.handle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Select Year</Text>
                            <TouchableOpacity onPress={() => setShowYearModal(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.grid}>
                            {YEARS.map(y => {
                                const active = selectedYear === y;
                                return (
                                    <TouchableOpacity
                                        key={y}
                                        style={[styles.gridItem, active && styles.gridItemActive]}
                                        onPress={() => { onYearChange(y); setShowYearModal(false); }}>
                                        <Text style={[styles.gridText, active && styles.gridTextActive]}>{y}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default VisibilityHeader;

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    row1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    statusDropdownWrap: {
        flex: 1,
        // maxWidth: 150,
    },
    pill: {
        flex: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    pillActive: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FED7AA',
    },
    pillText: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: '#475569',
    },

    pillTextActive: {
        color: Colors.orange,
    },
    statusRow: {
        display: 'none',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 34,
        paddingTop: 10,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
        marginBottom: 14,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    sheetTitle: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: '#0F172A',
    },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    gridItem: {
        width: (width - 40 - 24) / 4,
        paddingVertical: 11,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    gridItemActive: {
        backgroundColor: Colors.darkButton,
        borderColor: Colors.darkButton,
    },
    gridText: {
        fontFamily: Fonts.medium,
        fontSize: Size.sm,
        color: '#475569',
    },
    gridTextActive: {
        color: '#FFFFFF',
    },
});
