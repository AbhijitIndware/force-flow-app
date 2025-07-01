/* eslint-disable react-native/no-inline-styles */
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import {
    Clock2,
    Funnel,
    Search,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const StoreTabContent = ({ navigation }: any) => {
    return (
        <View
            style={{
                width: '100%',
                flex: 1,
                backgroundColor: Colors.lightBg,
                position: 'relative',
            }}>
            <View
                style={[
                    styles.bodyContent,
                    { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 70 },
                ]}>
                <View style={styles.bodyHeader}>
                    <Text style={styles.bodyHeaderTitle}>
                        All Store
                    </Text>
                    <View style={styles.bodyHeaderIcon}>
                        <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
                        <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
                    </View>
                </View>
                <View>
                    {/* card section start here */}
                    <View style={styles.atteddanceCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.timeSection}>
                                <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                                <Text style={styles.time}> 11:03:45 AM</Text>
                            </View>
                            <Text style={[styles.present, { marginLeft: 'auto' }]}>
                                Approved
                            </Text>
                        </View>
                        <View style={styles.cardbody}>
                            <View style={styles.dateBox}>
                                <Text style={styles.dateText}>19</Text>
                                <Text style={styles.monthText}>Jan</Text>
                            </View>
                            <View style={{ width: '80%' }}>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                    <Text style={styles.contentText}>ID: dist-00123</Text>
                                    <Text style={styles.contentText}>Zone: North</Text>
                                </View>
                                <Text style={styles.contentText}>Distributor name</Text>
                                <Text style={[styles.contentText, { fontFamily: Fonts.medium }]}>
                                    Accestisa new mart
                                </Text>
                                <Text style={styles.contentText}>
                                    City: New Delhi
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.atteddanceCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.timeSection}>
                                <Text style={styles.time}> PO ID: PO-1001</Text>
                            </View>
                            <Text style={[styles.leave, { marginLeft: 'auto' }]}>
                                Submitted
                            </Text>
                        </View>
                        <View style={styles.cardbody}>
                            <View style={styles.dateBox}>
                                <Text style={styles.dateText}>19</Text>
                                <Text style={styles.monthText}>Jan</Text>
                            </View>
                            <View style={{ width: '80%' }}>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                    <Text style={styles.contentText}>ID: dist-00123</Text>
                                    <Text style={styles.contentText}>Zone: South</Text>
                                </View>
                                <Text style={styles.contentText}>Distributor name</Text>
                                <Text style={[styles.contentText, { fontFamily: Fonts.medium }]}>
                                    Accestisa new mart
                                </Text>
                                <Text style={styles.contentText}>
                                    City: New Delhi
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.atteddanceCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.timeSection}>
                                <Text style={styles.time}> PO ID: PO-1001</Text>
                            </View>
                            <Text style={[styles.leave, { marginLeft: 'auto' }]}>
                                Submitted
                            </Text>
                        </View>
                        <View style={styles.cardbody}>
                            <View style={styles.dateBox}>
                                <Text style={styles.dateText}>19</Text>
                                <Text style={styles.monthText}>Jan</Text>
                            </View>
                            <View style={{ width: '80%' }}>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                    <Text style={styles.contentText}>ID: dist-00123</Text>
                                    <Text style={styles.contentText}>Zone: East</Text>
                                </View>
                                <Text style={styles.contentText}>Distributor name</Text>
                                <Text style={[styles.contentText, { fontFamily: Fonts.medium }]}>
                                    Accestisa new mart
                                </Text>
                                <Text style={styles.contentText}>
                                    City: New Delhi
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.atteddanceCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.timeSection}>
                                <Text style={styles.time}> PO ID: PO-1001</Text>
                            </View>
                            <Text style={[styles.present, { marginLeft: 'auto' }]}>
                                Approved
                            </Text>
                        </View>
                        <View style={styles.cardbody}>
                            <View style={styles.dateBox}>
                                <Text style={styles.dateText}>19</Text>
                                <Text style={styles.monthText}>Jan</Text>
                            </View>
                            <View style={{ width: '80%' }}>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                    <Text style={styles.contentText}>ID: dist-00123</Text>
                                    <Text style={styles.contentText}>Zone: West</Text>
                                </View>
                                <Text style={styles.contentText}>Distributor name</Text>
                                <Text style={[styles.contentText, { fontFamily: Fonts.medium }]}>
                                    Accestisa new mart
                                </Text>
                                <Text style={styles.contentText}>
                                    City: New Delhi
                                </Text>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
        </View>
    )
}

export default StoreTabContent

const styles = StyleSheet.create({
    bodyContent: { flex: 1 },
    bodyHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E4E9',
    },
    bodyHeaderTitle: {
        color: Colors.darkButton,
        fontFamily: Fonts.semiBold,
        fontSize: Size.xsmd,
        lineHeight: 20,
    },
    bodyHeaderIcon: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
    },

    //atteddanceCard section css
    atteddanceCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: 10,
    },
    cardHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeSection: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    time: {
        color: Colors.darkButton,
        fontFamily: Fonts.semiBold,
        fontSize: Size.xs,
        lineHeight: 18,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
    },

    present: {
        backgroundColor: Colors.lightSuccess,
        color: Colors.sucess,
        fontFamily: Fonts.regular,
        fontSize: Size.sm,
        lineHeight: 18,
        padding: 8,
        borderRadius: 50,
        paddingHorizontal: 15,
    },

    lateEntry: {
        backgroundColor: Colors.holdLight,
        color: Colors.orange,
        fontFamily: Fonts.regular,
        fontSize: Size.sm,
        lineHeight: 18,
        padding: 8,
        borderRadius: 50,
        paddingHorizontal: 15,
    },

    leave: {
        backgroundColor: Colors.lightBlue,
        color: Colors.blue,
        fontFamily: Fonts.regular,
        fontSize: Size.sm,
        lineHeight: 18,
        padding: 8,
        borderRadius: 50,
        paddingHorizontal: 15,
    },
    absent: {
        backgroundColor: Colors.lightDenger,
        color: Colors.denger,
        fontFamily: Fonts.regular,
        fontSize: Size.sm,
        lineHeight: 18,
        padding: 8,
        borderRadius: 50,
        paddingHorizontal: 15,
    },

    cardbody: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 10,
        paddingTop: 0,
    },
    dateBox: {
        width: 50,
        height: 50,
        borderColor: Colors.darkButton,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: Colors.transparent,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 5,
    },
    dateText: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.sm,
        color: Colors.darkButton,
        padding: 0,
        margin: 0,
        lineHeight: 18,
    },
    monthText: {
        fontFamily: Fonts.regular,
        color: Colors.darkButton,
        fontSize: Size.xs,
    },
    contentText: {
        fontFamily: Fonts.regular,
        color: Colors.darkButton,
        fontSize: Size.sm,
        lineHeight: 20,
    },

    checkinButton: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Colors.darkButton,
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 18,
        position: 'absolute',
        bottom: -65,
        gap: 5,
        zIndex: 1,
        width: width * 0.9,
    },
    checkinButtonText: {
        fontFamily: Fonts.medium,
        fontSize: Size.sm,
        color: Colors.white,
        lineHeight: 22,
    },
    countBoxSection: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 17,
        flexDirection: 'row',
    },
    countBox: {
        backgroundColor: Colors.white,
        width: '33.33%',
        borderRadius: 15,
        padding: 10,
        minHeight: 135,
        shadowColor: '#9F9D9D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 3.84,
        elevation: 15,
    },
    countBoxIcon: {
        width: 45,
        height: 45,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Colors.darkButton,
        borderRadius: 15,
        marginBottom: 10,
        marginLeft: 'auto',
    },
    countBoxTitle: {
        fontFamily: Fonts.regular,
        color: Colors.darkButton,
        fontSize: Size.xs,
        lineHeight: 18,
    },
    countBoxDay: {
        fontFamily: Fonts.semiBold,
        color: Colors.darkButton,
        fontSize: Size.xslg,
        lineHeight: 20,
        position: 'relative',
    },
    //countBox-section css end
});
