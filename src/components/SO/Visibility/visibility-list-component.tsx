import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {Colors} from '../../../utils/colors';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import LoadingScreen from '../../ui/LoadingScreen';
import {VisibilityClaim} from '../../../types/baseType';

interface Props {
  navigation: any;
  isFetching: boolean;
  claims: VisibilityClaim[];
}

const VisibilityListComponent = ({navigation, isFetching, claims}: Props) => {
  return (
    <View style={styles.container}>
      {isFetching ? (
        <LoadingScreen />
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.dataBoxSection}
          scrollEventThrottle={16}>
          {claims?.length ? (
            claims.map((item, index) => (
              <TouchableOpacity
                key={`${item.claim_id}-${index}`}
                style={styles.dataBox}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('VisibilityClaimDetails', {
                    claimId: item.claim_id,
                  })
                }>
                {/* Left Section */}
                <View style={{flex: 1}}>
                  <Text style={styles.quantityCount}>{item.employee_name}</Text>

                  <Text style={styles.quantitytime}>Store : {item.store}</Text>

                  <Text style={styles.quantitytime}>
                    {moment(item.date).format('DD MMM YYYY')}
                  </Text>

                  <Text style={styles.quantitytime}>
                    Payment : {item.payment_type}
                  </Text>
                </View>

                {/* Right Section */}
                <View style={styles.positionValue}>
                  <Text style={styles.incressValu}>
                    ₹ {item.collection_amount}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No visibility claims found</Text>
          )}
        </Animated.ScrollView>
      )}
    </View>
  );
};

export default VisibilityListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
    marginBottom: 6,
    color: Colors.darkButton,
  },

  readonlyInput: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border || '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
  },

  readonlyText: {
    fontSize: Size.sm,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.gray,
  },

  //target&achivement section css start
  HeadingHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  dataBoxSection: {paddingTop: 15},
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
  positionValue: {display: 'flex', flexDirection: 'row', alignItems: 'center'},
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
    // lineHeight: 22,
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
});
