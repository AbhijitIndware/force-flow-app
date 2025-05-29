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
import {flexCol} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../components/ui/LoadingScreen';
import React, {useCallback, useState} from 'react';
import {AppStackParamList} from '../../types/Navigation';
import PageHeader from '../../components/ui/PageHeader';
import { Size } from '../../utils/fontSize';
import { Fonts } from '../../constants';

import {Clock, Download, Funnel, Search, Upload } from 'lucide-react-native';
import FilterModal from '../../components/ui/filterModal';


//const { width } = Dimensions.get('window');
//const { height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'DownloadScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};



const DownloadScreen = ({navigation}: Props) => {
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
      <PageHeader title="Download" navigation={() => navigation.goBack()} />
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
            <View style={styles.downloadCard}>
              <View>
                <Text style={{fontFamily:Fonts.regular, fontSize:Size.sm, color:Colors.darkButton, paddingTop:8}}>Doc name: <Text style={{ fontFamily:Fonts.semiBold}}>Company profile</Text> </Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:10, flexWrap:'wrap', marginTop:2}}>
                  <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Upload strokeWidth={1.4} color="#A9A9A9"  size={18}/>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.blue}}>Uploaded: 12:12: 2025</Text>
                  </View>
                  <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Clock strokeWidth={1.4} color="#A9A9A9"  size={18}/>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.orange}}>11:03:45 AM</Text>
                  </View>
                </View>
              </View>
              <View style={styles.downloadIcon}>
                <Download strokeWidth={1.4} color={Colors.orange} size={20} />
              </View>
            </View>
            <View style={styles.downloadCard}>
              <View>
                <Text style={{fontFamily:Fonts.regular, fontSize:Size.sm, color:Colors.darkButton, paddingTop:8}}>Doc name: <Text style={{ fontFamily:Fonts.semiBold}}>Company profile</Text> </Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:10, flexWrap:'wrap', marginTop:2}}>
                  <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Upload strokeWidth={1.4} color="#A9A9A9"  size={18}/>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.blue}}>Uploaded: 12:12: 2025</Text>
                  </View>
                  <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Clock strokeWidth={1.4} color="#A9A9A9"  size={18}/>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.orange}}>11:03:45 AM</Text>
                  </View>
                </View>
              </View>
              <View style={styles.downloadIcon}>
                <Download strokeWidth={1.4} color={Colors.orange} size={20} />
              </View>
            </View>
            <View style={styles.downloadCard}>
              <View>
                <Text style={{fontFamily:Fonts.regular, fontSize:Size.sm, color:Colors.darkButton, paddingTop:8}}>Doc name: <Text style={{ fontFamily:Fonts.semiBold}}>Company profile</Text> </Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:10, flexWrap:'wrap', marginTop:2}}>
                  <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Upload strokeWidth={1.4} color="#A9A9A9"  size={18}/>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.blue}}>Uploaded: 12:12: 2025</Text>
                  </View>
                  <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Clock strokeWidth={1.4} color="#A9A9A9"  size={18}/>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.orange}}>11:03:45 AM</Text>
                  </View>
                </View>
              </View>
              <View style={styles.downloadIcon}>
                <Download strokeWidth={1.4} color={Colors.orange} size={20} />
              </View>
            </View>
            <View style={styles.downloadCard}>
              <View>
                <Text style={{fontFamily:Fonts.regular, fontSize:Size.sm, color:Colors.darkButton, paddingTop:8}}>Doc name: <Text style={{ fontFamily:Fonts.semiBold}}>Company profile</Text> </Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:10, flexWrap:'wrap', marginTop:2}}>
                  <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Upload strokeWidth={1.4} color="#A9A9A9"  size={18}/>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.blue}}>Uploaded: 12:12: 2025</Text>
                  </View>
                  <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Clock strokeWidth={1.4} color="#A9A9A9"  size={18}/>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.orange}}>11:03:45 AM</Text>
                  </View>
                </View>
              </View>
              <View style={styles.downloadIcon}>
                <Download strokeWidth={1.4} color={Colors.orange} size={20} />
              </View>
            </View>
         </View>

        </ScrollView>

      )}
    </SafeAreaView>
  );
};

export default DownloadScreen;

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
    marginTop:20,
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

  downloadCard:{backgroundColor:Colors.white, padding:15, borderRadius:15, display:'flex', flexDirection:'row',
    alignItems:'flex-start', justifyContent:'space-between', marginTop:15,
  },

  downloadIcon:{width:30, height:30,backgroundColor:Colors.holdLight,borderRadius:10, display:'flex',
    justifyContent:'center', alignItems:'center',
  },

});
