import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../utils/colors';
import { Size } from '../../../utils/fontSize';
import { Fonts } from '../../../constants';
import ReusableInput from '../../ui-lib/reuseable-input';
import { CirclePlus, MoveUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AddExpenseComponent = ({ navigation }: any) => {


  return (
    <View style={[styles.container]}>


      {/* <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: {} } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ padding: 10 }}
      >
        <ReusableInput label="Expense Approvaer" value={''} onChangeText={function (text: string): void {
          throw new Error('Function not implemented.');
        }} onBlur={function (): void {
          throw new Error('Function not implemented.');
        }} />
      </Animated.ScrollView> */}

      
        <View style={styles.HeadingHead}>
          <Text style={styles.SectionHeading}>Total Expense</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddExpenseItemScreen')}>
            <View style={[{display:'flex', flexDirection:'row', gap: 10}]}>
              <Text style={[{fontSize:Size.sm, fontFamily:Fonts.medium}]}>₹ 2,200</Text> 
              <CirclePlus size={20} color={Colors.black} style={[{position:'relative', }]} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.dataBoxSection}>
          <View style={styles.dataBox}>
            <View>
              <Text style={styles.quantityCount}>Food</Text>
              <Text style={styles.quantitytime}>Sanctioned : ₹ 1,000 27 Nov</Text>
            </View>
            <View style={styles.positionValue}>
              {/* <MoveUp strokeWidth={2} color={Colors.darkButton} /> */}
              <Text style={styles.incressValu}>₹ 1,000</Text>
            </View>
          </View>
          <View style={styles.dataBox}>
            <View>
              <Text style={styles.quantityCount}>Other</Text>
              <Text style={styles.quantitytime}>Sanctioned : ₹ 200 27 Nov</Text>
            </View>
            <View style={styles.positionValue}>
              {/* <MoveUp strokeWidth={2} color={Colors.darkButton} /> */}
              <Text style={styles.incressValu}>₹ 200</Text>
            </View>
          </View>
          <View style={styles.dataBox}>
            <View>
              <Text style={styles.quantityCount}>Food</Text>
              <Text style={styles.quantitytime}>Sanctioned : ₹ 1,000 27 Nov</Text>
            </View>
            <View style={styles.positionValue}>
              {/* <MoveUp strokeWidth={2} color={Colors.darkButton} /> */}
              <Text style={styles.incressValu}>₹ 1,000</Text>
            </View>
          </View>
        </View>
      








    </View>





  );
};

export default AddExpenseComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
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
    shadowOffset: { width: 0, height: 6 },
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
  name: { fontFamily: Fonts.medium, fontSize: Size.sm, color: Colors.white },
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

  paraText: { fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm },
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
    //marginTop: 15,
    marginRight: 15,
    marginLeft: 15,
  },
  checkinButtonText: {
    fontFamily: Fonts.regular,
    fontSize: Size.md,
    color: Colors.white,
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
  HeadingHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
  },
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,

  },
  dataBoxSection: { paddingTop: 15 },
  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionValue: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  incressValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: Colors.sucess,
    paddingHorizontal: 0,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },
  quantityCount: {
    fontFamily: Fonts.medium,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  iconbox: {
    width: 60,
    height: 60,
    backgroundColor: Colors.sucess,
    borderRadius: 18,
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
  LinkSection: { backgroundColor: Colors.white },

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
