import React from 'react';
import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { flexCol, flexRow, itemsCenter } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useGetActivityLocationsQuery } from '../../../features/base/base-api';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { MapPin, Plus, Navigation2, Map } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<
    SoAppStackParamList,
    'ActivityLocationScreen'
>;

type Props = {
    navigation: NavigationProp;
};

const ActivityLocationScreen = ({ navigation }: Props) => {
    const { data: locationsData, isLoading, isFetching, refetch } = useGetActivityLocationsQuery();

    const renderLocationCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={[flexRow, itemsCenter]}>
                <View style={styles.iconContainer}>
                    <MapPin size={20} color={Colors.white} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.locationName}>{item.location_name}</Text>
                    <View style={[flexRow, { marginTop: 4, alignItems: 'flex-start' }]}>
                        <Navigation2 size={12} color={Colors.gray} style={{ marginTop: 2, marginRight: 4 }} />
                        <Text style={styles.address} numberOfLines={2}>
                            {item.address || 'No address available'}
                        </Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.coordinatesRow}>
                <View style={styles.coordBox}>
                    <Text style={styles.coordLabel}>Lat: </Text>
                    <Text style={styles.coordValue}>{item.latitude.toFixed(6)}</Text>
                </View>
                <View style={styles.coordBox}>
                    <Text style={styles.coordLabel}>Long: </Text>
                    <Text style={styles.coordValue}>{item.longitude.toFixed(6)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.white }]}>
            <PageHeader title="Activity Locations" navigation={() => navigation.goBack()} />

            {isLoading ? (
                <LoadingScreen />
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={locationsData?.message?.data || []}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderLocationCard}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        onRefresh={refetch}
                        refreshing={isFetching}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Map size={60} color={Colors.lightGray} strokeWidth={1} />
                                <Text style={styles.emptyText}>No activity locations found</Text>
                                <Text style={styles.emptySubText}>Add your first location to get started</Text>
                            </View>
                        }
                    />

                    <TouchableOpacity
                        style={styles.fab}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('AddActivityLocationScreen')}
                    >
                        <Plus size={24} color={Colors.white} />
                        <Text style={styles.fabText}>Add New Location</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default ActivityLocationScreen;

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EEF0F4',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.darkButton,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationName: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.sm,
        color: Colors.darkButton,
    },
    address: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: Colors.gray,
        lineHeight: 16,
    },
    coordinatesRow: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 15,
    },
    coordBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coordLabel: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: Colors.gray,
    },
    coordValue: {
        fontFamily: Fonts.medium,
        fontSize: 11,
        color: Colors.darkButton,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.sm,
        color: Colors.darkButton,
        marginTop: 15,
    },
    emptySubText: {
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: Colors.gray,
        marginTop: 5,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: Colors.orange,
        borderRadius: 30,
        height: 56,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.xs,
        color: Colors.white,
        marginLeft: 8,
    },
});
