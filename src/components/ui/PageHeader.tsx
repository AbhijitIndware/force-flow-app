import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import {boxShadow} from '../../utils/styles';
import Feather from 'react-native-vector-icons/Feather';
import { Size } from '../../utils/fontSize';
const { width } = Dimensions.get('window');
type Props = {
  title: string;
  navigation: () => void;
};

const PageHeader = ({title, navigation}: Props) => {
  return (
    <View style={[styles.headerTitleContainer, boxShadow]}>
      <View style={styles.backButtonSection}>
        <TouchableOpacity onPress={navigation}>
          <Feather name="arrow-left" size={24} color={Colors.greyDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title as string}</Text>
      </View>
      <View style={styles.alignment}>
        <TouchableOpacity  style={styles.notification}>
              <View style={styles.notificationBatch}>
                  <Text style={styles.notificationCount}>5</Text>
              </View>
              <Feather name="bell" size={24} color={Colors.greyDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.userInfo}>
          <Image source={require('../../assets/images/user.jpg')} resizeMode="cover" style={styles.avtarImage} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create({
   headerTitleContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop:35,
    paddingBottom:15,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonSection:{display:'flex',flexDirection:'row',gap:5, alignItems:'center'},
  headerTitle: {
    color: Colors.darkButton,
    fontFamily: Fonts.medium,
    fontSize:Size.sm,
  },
  BackIconContainer: {
    width: 23,
    height: 23,
    borderRadius: 100,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignment:{
     display:'flex',
     flexDirection:'row',
     justifyContent:'center',
     alignItems:'center',
     gap:18,
  },

  logoImage:{
     width: width * 0.4, height:36,
  },

  notification:{position:'relative',top:6},
  notificationBatch:{width:26,height:26, backgroundColor:Colors.orange, borderRadius:50, display:'flex',
    alignItems:'center', justifyContent:'center', position:'absolute', zIndex:1, right:-13,top:-14, borderColor: Colors.white, borderWidth:3,
  },
  notificationCount:{color:Colors.white},

  userInfo:{overflow:'hidden',borderRadius:15},
  avtarImage:{
    width: width * 0.12, height:50,
  },
});
