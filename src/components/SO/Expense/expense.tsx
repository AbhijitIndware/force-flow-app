import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  BanknoteArrowDown,
  BriefcaseConveyorBelt,
  Calculator,
  ChevronRight,
  CircleCheck,
  CircleCheckBig,
  CircleX,
  FileText,
  RotateCw,
  Wallet,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const ExpenseComponent = ({navigation}: any) => {
  return (
    <ScrollView>
      <View style={styles.countBoxSection}>
        <View style={styles.countBox}>
          <View
            style={[styles.countBoxIcon, {backgroundColor: Colors.holdLight}]}>
            <RotateCw strokeWidth={1.4} color={Colors.orange} />
          </View>
          <Text style={styles.countBoxDay}>0</Text>
          <Text style={styles.countBoxTitle}>Pending</Text>
        </View>
        <View style={styles.countBox}>
          <View
            style={[
              styles.countBoxIcon,
              {backgroundColor: Colors.lightSuccess},
            ]}>
            <CircleCheckBig strokeWidth={1.4} color={Colors.success} />
          </View>
          <Text style={styles.countBoxDay}>0</Text>
          <Text style={styles.countBoxTitle}>Approve</Text>
        </View>
        <View style={styles.countBox}>
          <View
            style={[styles.countBoxIcon, {backgroundColor: Colors.lightRed}]}>
            <CircleX strokeWidth={1.4} color={Colors.error} />
          </View>
          <Text style={styles.countBoxDay}>0</Text>
          <Text style={styles.countBoxTitle}>Reject</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('AddExpenseScreen')}
        style={styles.checkinButton}>
        <Text style={styles.checkinButtonText}>Claim an Expense</Text>
        <Ionicons
          name="chevron-forward-circle-sharp"
          size={24}
          color={Colors.white}
        />
      </TouchableOpacity>

      <View style={[styles.quick, {paddingTop: 0}]}>
        <View style={styles.HeadingHead}>
          <Text style={styles.SectionHeading}>Quick Create</Text>
          <TouchableOpacity
            style={styles.viewallButton}
            onPress={() => navigation.navigate('AddExpenseScreen')}>
            <Text style={styles.viewaText}>View All</Text>
            <ChevronRight size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        <View style={[styles.dataBox, {marginTop: 2}]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ExpenseListScreen')}
            style={[styles.positionValue]}>
            <View style={styles.incentiveContent}>
              <View style={styles.iconbox}>
                <Calculator strokeWidth={2} color={Colors.white} size={30} />
              </View>
              <View>
                <Text style={styles.quantitytime}>Expenses</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ExpenseScreen')}
            style={[styles.positionValue]}>
            <View style={styles.incentiveContent}>
              <View style={styles.iconbox}>
                <FileText strokeWidth={2} color={Colors.white} size={30} />
              </View>
              <View>
                <Text style={styles.quantitytime}>Report</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ExpenseScreen')}
            style={[styles.positionValue]}>
            <View style={styles.incentiveContent}>
              <View style={styles.iconbox}>
                <BriefcaseConveyorBelt
                  strokeWidth={2}
                  color={Colors.white}
                  size={30}
                />
              </View>
              <View>
                <Text style={styles.quantitytime}>Trip</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ExpenseScreen')}
            style={[styles.positionValue]}>
            <View style={styles.incentiveContent}>
              <View style={styles.iconbox}>
                <Wallet strokeWidth={2} color={Colors.white} size={30} />
              </View>
              <View>
                <Text style={styles.quantitytime}>Advance</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.quick, {paddingTop: 0}]}>
        <Text style={styles.SectionHeading}>Pending Approval</Text>
        <View style={[styles.paBox]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ExpenseScreen')}>
            <View style={styles.pendappContent}>
              <View>
                <FileText strokeWidth={2} color={Colors.black} size={30} />
              </View>
              <View>
                <Text style={styles.quantityCount}>Reports</Text>
              </View>
              <View>
                <CircleCheck strokeWidth={2} color={Colors.black} size={30} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ExpenseScreen')}>
            <View style={styles.pendappContent}>
              <View>
                <BriefcaseConveyorBelt
                  strokeWidth={2}
                  color={Colors.black}
                  size={30}
                />
              </View>
              <View>
                <Text style={styles.quantityCount}>Trips</Text>
              </View>
              <View>
                <CircleCheck strokeWidth={2} color={Colors.black} size={30} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ExpenseComponent;

// const styles = StyleSheet.create({});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },
  quick: {
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },
  HeadingHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
  },
  //header-box-section css start
  headerSec: {
    backgroundColor: Colors.white,
    minHeight: 200,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android Shadow
    elevation: 2,
  },
  welcomeText: {
    fontFamily: Fonts.light,
    color: Colors.white,
    fontSize: Size.sm,
  },
  name: {fontFamily: Fonts.medium, fontSize: Size.sm, color: Colors.white},
  welcomBox: {
    padding: 15,
    backgroundColor: Colors.orange,
    borderRadius: 15,
    paddingVertical: 20,
    marginTop: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    position: 'relative',
  },

  linkBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 15,
    marginTop: 8,
    gap: 10,
  },

  dateBox: {
    width: 50,
    height: 50,
    borderColor: Colors.white,
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
    color: Colors.white,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  monthText: {
    fontFamily: Fonts.regular,
    color: Colors.white,
    fontSize: Size.xs,
  },

  linkContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: Colors.white,
    gap: 1,
    alignItems: 'flex-start',
    width: '80%',
  },

  planLink: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  paraText: {fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm},
  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'relative',
    gap: 5,
    marginTop: 15,
    marginRight: 15,
    marginLeft: 15,
  },
  viewallButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    //backgroundColor: Colors.darkButton,
    //borderRadius: 8,
    //paddingHorizontal: 10,
    //paddingVertical: 3,
    position: 'relative',
    gap: 3,
  },
  checkinButtonText: {
    fontFamily: Fonts.regular,
    fontSize: Size.md,
    color: Colors.white,
    lineHeight: 22,
  },
  viewaText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.black,
    lineHeight: 22,
  },

  //header-box-section css end
  //countBox-section css start
  countBoxSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
  },
  countBox: {
    backgroundColor: Colors.white,
    width: width * 0.28,
    borderRadius: 15,
    padding: 10,
    minHeight: 110,
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
    fontSize: Size.xsmd,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: Size.md,
    lineHeight: 20,
    position: 'relative',
    marginTop: 0,
  },
  //countBox-section css end

  //target&achivement section css start
  SectionHeading: {
    fontFamily: Fonts.medium,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  dataBoxSection: {paddingTop: 15},
  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  paBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    display: 'flex',
    flexDirection: 'column',
    //justifyContent: 'center',
    //alignItems: 'center',
    gap: 12,
  },
  positionValue: {display: 'flex', flexDirection: 'row', alignItems: 'center'},
  incressValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: Colors.sucess,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },
  quantityCount: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
    lineHeight: 22,
  },
  quantitytime: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
    lineHeight: 20,
  },

  decriseValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },

  //incentive section css start
  incentiveContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  pendappContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    backgroundColor: Colors.lightYellow,
    padding: 10,
    borderRadius: 6,
  },
  iconbox: {
    width: 60,
    height: 60,
    backgroundColor: Colors.sucess,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listLink: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
  },
  listLinkText: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.regular,
  },
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },

  //incentive section css start
  LinkSection: {backgroundColor: Colors.white},

  IconlinkBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  linkTitle: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
  },
});
