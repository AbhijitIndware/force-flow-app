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
  EllipsisVertical,
  Funnel,
  Search,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PJPScreen = ({ navigation }: any) => {
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
            Recent PJP
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
              <Text style={[styles.leave, { marginLeft: 'auto' }]}>
                January
              </Text>
              <EllipsisVertical size={20} color={Colors.darkButton} />
            </View>
            <View style={styles.cardbody}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>19</Text>
                <Text style={styles.monthText}>Jan</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: Colors.darkButton,
                  }}>
                  PJP of January
                </Text>
                <Text style={styles.contentText}>Store name</Text>
                <Text style={styles.contentText}>
                  Accestisa new mart
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.atteddanceCard}>
            <View style={styles.cardHeader}>
              <View style={styles.timeSection}>
                <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                <Text style={styles.time}> 11:03:45 AM</Text>
              </View>
              <Text style={[styles.leave, { marginLeft: 'auto' }]}>
                March
              </Text>
              <EllipsisVertical size={20} color={Colors.darkButton} />
            </View>
            <View style={styles.cardbody}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>25</Text>
                <Text style={styles.monthText}>Mar</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: Colors.darkButton,
                  }}>
                  PJP of March
                </Text>
                <Text style={styles.contentText}>Store name</Text>
                <Text style={styles.contentText}>
                  Accestisa new mart
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.atteddanceCard}>
            <View style={styles.cardHeader}>
              <View style={styles.timeSection}>
                <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                <Text style={styles.time}> 11:03:45 AM</Text>
              </View>
              <Text style={[styles.leave, { marginLeft: 'auto' }]}>
                April
              </Text>
              <EllipsisVertical size={20} color={Colors.darkButton} />
            </View>
            <View style={styles.cardbody}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>26</Text>
                <Text style={styles.monthText}>Apr</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: Colors.darkButton,
                  }}>
                  PJP of April
                </Text>
                <Text style={styles.contentText}>Store name</Text>
                <Text style={styles.contentText}>
                  Accestisa new mart
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PJPScreen


const styles = StyleSheet.create({
  //bodyContent section css
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
});
