/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  useGetStoreActivitiesQuery,
  useGetEmployeeAssignedStoresQuery,
} from '../../../features/base/promoter-base-api';
import {imageBaseUrl} from '../../../features/apiBaseUrl';
import {StoreActivity} from '../../../types/baseType';
import FilterModal from '../../../components/ui/filterModal';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Funnel,
  MapPin,
  Plus,
} from 'lucide-react-native';
import moment from 'moment';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'StoreActivityScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ACTIVITY_FILTERS = ['All', 'Own', 'Competitors'];

const StoreActivityScreen = ({navigation}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStore, setSelectedStore] = useState('');
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [reviewList, setReviewList] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);

  const openReview = (url: string, list: string[], index: number) => {
    setReviewList(list);
    setReviewIndex(index);
    setReviewImage(url);
  };

  const goPrev = () => {
    if (reviewList.length <= 1) return;
    const next = (reviewIndex - 1 + reviewList.length) % reviewList.length;
    setReviewIndex(next);
    setReviewImage(reviewList[next]);
  };

  const goNext = () => {
    if (reviewList.length <= 1) return;
    const next = (reviewIndex + 1) % reviewList.length;
    setReviewIndex(next);
    setReviewImage(reviewList[next]);
  };

  const {data: assignedStoresData} = useGetEmployeeAssignedStoresQuery();

  const stores =
    assignedStoresData?.message?.data?.stores?.map(s => ({
      label: s.store_name,
      value: s.store_id,
    })) ?? [];

  const {
    data: activityData,
    isFetching,
    refetch,
  } = useGetStoreActivitiesQuery({
    activity_type: selectedType === 'All' ? undefined : selectedType,
    ...(selectedStore ? {store: selectedStore} : {}),
    page: 1,
    page_size: 20,
  });

  const activities = activityData?.message?.data?.activities ?? [];
  const totalCount =
    activityData?.message?.data?.pagination?.total_records ?? 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
    }, 2000);
  }, [refetch]);

  const renderActivity = ({item}: {item: StoreActivity}) => {
    const dateTime = moment(item.date_and_time);
    const imageList = item.images.map(img => `${imageBaseUrl}${img}`);
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardHeader}>
            <View style={styles.typeAvatar}>
              <Camera size={15} color={Colors.orange} strokeWidth={2} />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeText} numberOfLines={1}>
                {item.activity_type}
              </Text>
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.activities_category || item.name}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            {dateTime.format('DD MMM · hh:mm A')}
          </Text>
        </View>

        <View style={styles.contentRow}>
          <View style={styles.textCol}>
            <View style={styles.storeRow}>
              <MapPin size={13} color={Colors.orange} strokeWidth={2} />
              <Text style={styles.storeName} numberOfLines={1}>
                {item.store_name}
              </Text>
            </View>
            {item.remark ? (
              <Text style={styles.remark} numberOfLines={2}>
                {item.remark}
              </Text>
            ) : null}
          </View>

          {imageList.length > 0 ? (
            <TouchableOpacity
              style={styles.imageWrap}
              activeOpacity={0.8}
              onPress={() => openReview(imageList[0], imageList, 0)}>
              <Image
                source={{uri: imageList[0]}}
                style={styles.activityImage}
                resizeMode="cover"
              />
              {imageList.length > 1 ? (
                <View style={styles.imageCountBadge}>
                  <Text style={styles.imageCountText}>
                    +{imageList.length - 1}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      <PageHeader
        title="Store Activity"
        navigation={() => navigation.goBack()}
      />

      <View style={styles.bodyHeader}>
        <View style={styles.bodyHeaderLeft}>
          <Text style={styles.bodyHeaderTitle}>Activities</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {isFetching ? '…' : totalCount || activities.length}
            </Text>
          </View>
        </View>
        <View style={styles.bodyHeaderIcon}>
          <FilterModal
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
            onApply={() => setModalVisible(false)}>
            <View style={styles.filterHeaderRow}>
              <Text style={styles.filterTitle}>Filters</Text>
              {selectedType !== 'All' || selectedStore ? (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedType('All');
                    setSelectedStore('');
                  }}>
                  <Text style={styles.clearFilterText}>Clear all</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.filterSectionTitle}>Activity Type</Text>
            <View style={styles.filterChips}>
              {ACTIVITY_FILTERS.map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[
                    styles.filterChip,
                    selectedType === type && styles.filterChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedType === type && styles.filterChipTextActive,
                    ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {stores.length > 1 ? (
              <>
                <Text style={[styles.filterSectionTitle, {marginTop: 16}]}>
                  Store
                </Text>
                <View style={styles.filterChips}>
                  <TouchableOpacity
                    onPress={() => setSelectedStore('')}
                    style={[
                      styles.filterChip,
                      selectedStore === '' && styles.filterChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedStore === '' && styles.filterChipTextActive,
                      ]}>
                      All Stores
                    </Text>
                  </TouchableOpacity>
                  {stores.map(store => (
                    <TouchableOpacity
                      key={store.value}
                      onPress={() => setSelectedStore(store.value)}
                      style={[
                        styles.filterChip,
                        selectedStore === store.value &&
                          styles.filterChipActive,
                      ]}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.filterChipText,
                          selectedStore === store.value &&
                            styles.filterChipTextActive,
                        ]}>
                        {store.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}
          </FilterModal>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={[
              styles.filterBtn,
              (selectedType !== 'All' || selectedStore) &&
                styles.filterBtnActive,
            ]}>
            <Funnel
              size={18}
              color={
                selectedType !== 'All' || selectedStore
                  ? Colors.white
                  : '#4A4A4A'
              }
              strokeWidth={1.7}
            />
          </TouchableOpacity>
        </View>
      </View>

      {refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Refreshing…</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item, index) => item.name ?? String(index)}
          renderItem={renderActivity}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Camera size={60} color={Colors.lightGray} strokeWidth={1} />
              <Text style={styles.emptyText}>
                {isFetching
                  ? 'Loading activities…'
                  : 'No store activities found'}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddStoreActivityScreen')}>
        <Plus size={24} color={Colors.white} />
        <Text style={styles.fabText}>Add Activity</Text>
      </TouchableOpacity>

      {/* Image review modal */}
      <Modal
        visible={reviewImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewImage(null)}>
        <View style={styles.reviewOverlay}>
          {reviewImage ? (
            <>
              <View style={styles.reviewHeader}>
                {reviewList.length > 1 ? (
                  <Text style={styles.reviewCounter}>
                    {reviewIndex + 1} / {reviewList.length}
                  </Text>
                ) : (
                  <Text style={styles.reviewTitle}>Photo Review</Text>
                )}
                <TouchableOpacity
                  onPress={() => setReviewImage(null)}
                  hitSlop={10}>
                  <Text style={styles.reviewClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.reviewBody}>
                {reviewList.length > 1 ? (
                  <TouchableOpacity
                    style={styles.reviewArrow}
                    onPress={goPrev}
                    hitSlop={10}>
                    <ChevronLeft size={28} color={Colors.white} />
                  </TouchableOpacity>
                ) : null}
                <Image
                  source={{uri: reviewImage}}
                  style={styles.reviewImage}
                  resizeMode="contain"
                />
                {reviewList.length > 1 ? (
                  <TouchableOpacity
                    style={styles.reviewArrow}
                    onPress={goNext}
                    hitSlop={10}>
                    <ChevronRight size={28} color={Colors.white} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StoreActivityScreen;

const styles = StyleSheet.create({
  bodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4E9',
  },
  bodyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bodyHeaderTitle: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    lineHeight: 18,
  },
  countBadge: {
    minWidth: 22,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.white,
  },
  bodyHeaderIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0F2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.orange,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  filterTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  clearFilterText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.orange,
  },
  filterSectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#E2E4E9',
    backgroundColor: '#F8F9FB',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  filterChipActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  filterChipText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  typeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flexShrink: 1,
    gap: 1,
  },
  typeText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#64748B',
  },
  remark: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.darkButton,
    lineHeight: 16,
    marginTop: 6,
    opacity: 0.85,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  textCol: {
    flex: 1,
  },
  imageWrap: {
    position: 'relative',
  },
  activityImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  imageCountBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: Colors.darkButton,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCountText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 50,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.gray,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Colors.darkButton,
    borderRadius: 30,
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.white,
    marginLeft: 8,
  },
  reviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  reviewCounter: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  reviewTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  reviewClose: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.white,
  },
  reviewBody: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  reviewArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewImage: {
    flex: 1,
    height: '75%',
    borderRadius: 12,
  },
});
