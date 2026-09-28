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
  useGetProductFeedbackListQuery,
} from '../../../features/base/promoter-base-api';
import {imageBaseUrl} from '../../../features/apiBaseUrl';
import {ProductFeedbackItem} from '../../../types/baseType';
import FilterModal from '../../../components/ui/filterModal';
import {ChevronLeft, ChevronRight, Funnel, MessageSquareQuote, Plus} from 'lucide-react-native';
import moment from 'moment';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'ProductFeedbackScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const FEEDBACK_FILTERS = ['All', 'Own', 'Competitor'];

const ProductFeedbackScreen = ({navigation}: Props) => {
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

  const {data: feedbackData, isFetching, refetch} =
    useGetProductFeedbackListQuery({
      type: selectedType === 'All' ? undefined : selectedType,
      page: 1,
      page_size: 20,
    });

  const feedbacks = feedbackData?.message?.data?.feedback ?? [];
  const totalCount = feedbackData?.message?.data?.pagination?.total_records ?? 0;
  const summary = feedbackData?.message?.data?.summary;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
    }, 2000);
  }, [refetch]);

  const renderFeedback = ({item}: {item: ProductFeedbackItem}) => {
    const dateTime = moment(item.time);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductFeedbackDetailScreen', {feedback: item})}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardHeader}>
            <View style={styles.typeAvatar}>
              <MessageSquareQuote
                size={15}
                color={Colors.orange}
                strokeWidth={2}
              />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeText} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.type}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            {dateTime.format('DD MMM · hh:mm A')}
          </Text>
        </View>

        <View style={styles.contentRow}>
          <View style={styles.textCol}>
            <Text style={styles.remark} numberOfLines={1}>
              {item.remarks || 'No remarks'}
            </Text>
          </View>

          {item.has_image && item.image ? (
            <TouchableOpacity
              style={styles.imageWrap}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                openReview(`${imageBaseUrl}${item.image}`, [
                  `${imageBaseUrl}${item.image}`,
                ], 0);
              }}>
              <Image
                source={{uri: `${imageBaseUrl}${item.image}`}}
                style={styles.feedbackImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
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
        title="Product Feedback"
        navigation={() => navigation.goBack()}
      />

      <View style={styles.bodyHeader}>
        <View style={styles.bodyHeaderLeft}>
          <Text style={styles.bodyHeaderTitle}>Feedback</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {isFetching ? '…' : totalCount || feedbacks.length}
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

            <Text style={styles.filterSectionTitle}>Type</Text>
            <View style={styles.filterChips}>
              {FEEDBACK_FILTERS.map(type => (
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

      <FlatList
        data={feedbacks}
        keyExtractor={(item, index) => item.name ?? String(index)}
        renderItem={renderFeedback}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageSquareQuote
              size={60}
              color={Colors.lightGray}
              strokeWidth={1}
            />
            <Text style={styles.emptyText}>
              {isFetching ? 'Loading feedback…' : 'No feedback found'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddProductFeedbackScreen')}>
        <Plus size={24} color={Colors.white} />
        <Text style={styles.fabText}>Add Feedback</Text>
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

export default ProductFeedbackScreen;

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
  feedbackImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  emptyContainer: {
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