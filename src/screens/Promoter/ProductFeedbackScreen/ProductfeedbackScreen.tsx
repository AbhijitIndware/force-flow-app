/* eslint-disable react-native/no-inline-styles */
import {
  RefreshControl,
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
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React, {useCallback, useState} from 'react';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {Clock2, EllipsisVertical, Funnel, Search} from 'lucide-react-native';
import FilterModal from '../../../components/ui/filterModal';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'ProductFeedbackScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ProductFeedbackScreen = ({navigation}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  console.log('🚀 ~ SalesScreen ~ selectedCategory:', selectedCategory);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          style={styles.container}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.bodyHeader}>
            <Text style={styles.bodyHeaderTitle}>Recent Shared</Text>
            <View style={styles.bodyHeaderIcon}>
              <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
              <FilterModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onApply={() => setModalVisible(false)}>
                <Text
                  onPress={() => setSelectedCategory('All')}
                  style={{paddingVertical: 10}}>
                  All
                </Text>
                <Text
                  onPress={() => setSelectedCategory('Electronics')}
                  style={{paddingVertical: 10}}>
                  Electronics
                </Text>
                <Text
                  onPress={() => setSelectedCategory('Books')}
                  style={{paddingVertical: 10}}>
                  Books
                </Text>
              </FilterModal>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <View style={styles.atteddanceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.timeSection}>
                  <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                  <Text style={styles.time}>11:03:45 AM</Text>
                </View>
                <EllipsisVertical size={20} color={Colors.darkButton} />
              </View>
              <View style={styles.cardbody}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>19</Text>
                  <Text style={styles.monthText}>APR</Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: Fonts.semiBold,
                      fontSize: Size.xsmd,
                      color: Colors.darkButton,
                      lineHeight: 18,
                      marginBottom: 5,
                    }}>
                    Feedback no: FF/223467
                  </Text>
                  <Text style={styles.contentText}>Store name</Text>
                  <Text style={styles.contentText}>Accestisa new mart</Text>
                  <Text style={styles.contentText}>
                    Feedback: Packaging problem
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.atteddanceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.timeSection}>
                  <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                  <Text style={styles.time}>11:03:45 AM</Text>
                </View>
                <EllipsisVertical size={20} color={Colors.darkButton} />
              </View>
              <View style={styles.cardbody}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>19</Text>
                  <Text style={styles.monthText}>APR</Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: Fonts.semiBold,
                      fontSize: Size.xsmd,
                      color: Colors.darkButton,
                      lineHeight: 18,
                      marginBottom: 5,
                    }}>
                    Feedback no: FF/223467
                  </Text>
                  <Text style={styles.contentText}>Store name</Text>
                  <Text style={styles.contentText}>Accestisa new mart</Text>
                  <Text style={styles.contentText}>
                    Feedback: Packaging problem
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.atteddanceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.timeSection}>
                  <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                  <Text style={styles.time}>11:03:45 AM</Text>
                </View>
                <EllipsisVertical size={20} color={Colors.darkButton} />
              </View>
              <View style={styles.cardbody}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>19</Text>
                  <Text style={styles.monthText}>APR</Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: Fonts.semiBold,
                      fontSize: Size.xsmd,
                      color: Colors.darkButton,
                      lineHeight: 18,
                      marginBottom: 5,
                    }}>
                    Feedback no: FF/223467
                  </Text>
                  <Text style={styles.contentText}>Store name</Text>
                  <Text style={styles.contentText}>Accestisa new mart</Text>
                  <Text style={styles.contentText}>
                    Feedback: Packaging problem
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.atteddanceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.timeSection}>
                  <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                  <Text style={styles.time}>11:03:45 AM</Text>
                </View>
                <EllipsisVertical size={20} color={Colors.darkButton} />
              </View>
              <View style={styles.cardbody}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>19</Text>
                  <Text style={styles.monthText}>APR</Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: Fonts.semiBold,
                      fontSize: Size.xsmd,
                      color: Colors.darkButton,
                      lineHeight: 18,
                      marginBottom: 5,
                    }}>
                    Feedback no: FF/223467
                  </Text>
                  <Text style={styles.contentText}>Store name</Text>
                  <Text style={styles.contentText}>Accestisa new mart</Text>
                  <Text style={styles.contentText}>
                    Feedback: Packaging problem
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.atteddanceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.timeSection}>
                  <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                  <Text style={styles.time}>11:03:45 AM</Text>
                </View>
                <EllipsisVertical size={20} color={Colors.darkButton} />
              </View>
              <View style={styles.cardbody}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>19</Text>
                  <Text style={styles.monthText}>APR</Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: Fonts.semiBold,
                      fontSize: Size.xsmd,
                      color: Colors.darkButton,
                      lineHeight: 18,
                      marginBottom: 5,
                    }}>
                    Feedback no: FF/223467
                  </Text>
                  <Text style={styles.contentText}>Store name</Text>
                  <Text style={styles.contentText}>Accestisa new mart</Text>
                  <Text style={styles.contentText}>
                    Feedback: Packaging problem
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ProductFeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },
  bodyHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4E9',
    marginTop: 20,
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
    fontFamily: Fonts.medium,
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
    paddingTop: 10,
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
});
