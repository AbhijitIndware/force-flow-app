/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
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
import {ProductFeedbackItem} from '../../../types/baseType';
import {imageBaseUrl} from '../../../features/apiBaseUrl';
import {ChevronLeft, ChevronRight} from 'lucide-react-native';
import moment from 'moment';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'ProductFeedbackDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: {params: {feedback: ProductFeedbackItem}};
};

const ProductFeedbackDetailScreen = ({navigation, route}: Props) => {
  const {feedback} = route.params;
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

  const dateTime = moment(feedback.time);

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
      title="Feedback Detail"
      navigation={() => navigation.goBack()}
    />
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: 40}}>
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardHeader}>
            <View style={styles.typeAvatar}>
              <Text style={styles.typeIcon}>{feedback.type === 'Own' ? 'O' : 'C'}</Text>
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeText}>{feedback.name}</Text>
              <Text style={styles.categoryText}>{feedback.type}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            {dateTime.format('DD MMM YYYY · hh:mm A')}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailSection}>
          <Text style={styles.sectionLabel}>Remarks</Text>
          <Text style={styles.remarkFull}>
            {feedback.remarks || 'No remarks'}
          </Text>
        </View>

        {feedback.has_image && feedback.image ? (
          <>
            <View style={styles.divider} />
            <View style={styles.detailSection}>
              <Text style={styles.sectionLabel}>Photo</Text>
              <TouchableOpacity
                style={styles.imageWrap}
                activeOpacity={0.8}
                onPress={() =>
                  openReview(`${imageBaseUrl}${feedback.image}`, [
                    `${imageBaseUrl}${feedback.image}`,
                  ], 0)
                }>
                <Image
                  source={{uri: `${imageBaseUrl}${feedback.image}`}}
                  style={styles.feedbackImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        <View style={styles.divider} />
        <View style={styles.detailSection}>
          <Text style={styles.sectionLabel}>Submitted by</Text>
          <Text style={styles.infoText}>{feedback.employee_name}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionLabel}>Feedback ID</Text>
          <Text style={styles.infoText}>{feedback.feedback_id}</Text>
        </View>
      </View>
    </ScrollView>

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

export default ProductFeedbackDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
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
    marginBottom: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  typeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.orange,
  },
  typeInfo: {
    flexShrink: 1,
    gap: 2,
  },
  typeText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.gray,
  },
  categoryText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E4E9',
    marginVertical: 12,
  },
  detailSection: {
    gap: 6,
  },
  sectionLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remarkFull: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
    lineHeight: 22,
  },
  infoText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  feedbackImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
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