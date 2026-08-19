
import React, {useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {flexCol} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';
import Feather from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import {WebView} from 'react-native-webview';
import {useGetManualVideoQuery} from '../../features/user-manual/user-manual-api';
import {UserManualVideo} from '../../types/userManualType';
import {SoAppStackParamList} from '../../types/Navigation';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'UserManualVideoScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: {
    params: {video?: UserManualVideo; video_id?: string};
  };
};

const UserManualVideoScreen = ({navigation, route}: Props) => {
  const {video: passedVideo, video_id} = route.params;
  const [loadError, setLoadError] = useState(false);

  const {data: resolvedData, isFetching: resolving} = useGetManualVideoQuery(
    {video_id: video_id as string},
    {skip: !!passedVideo || !video_id},
  );

  const video: UserManualVideo | undefined =
    passedVideo ?? resolvedData?.data?.video;

  const loading = (!video && resolving) || (!video && !video_id);

  return (
    <SafeAreaView style={[flexCol, styles.safeArea]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-back" size={24} color={Colors.greyDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video?.title ?? 'User Manual'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={Colors.orange} />
        </View>
      ) : video ? (
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          {/* Player */}
          <View style={styles.playerBox}>
            {video.is_external ? (
              <WebView
                source={{uri: video.url}}
                style={styles.webView}
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.playerLoader}>
                    <ActivityIndicator size="small" color={Colors.orange} />
                  </View>
                )}
              />
            ) : (
              <Video
                source={{uri: video.url}}
                style={styles.video}
                resizeMode="contain"
                controls
                repeat={false}
                onError={() => setLoadError(true)}
              />
            )}
          </View>

          {loadError && !video.is_external && (
            <Text style={styles.errorText}>
              Could not play this clip. Please try again.
            </Text>
          )}

          {/* Details */}
          <View style={styles.detailCard}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            {video.description ? (
              <Text style={styles.videoDesc}>{video.description}</Text>
            ) : null}
            <View style={styles.metaRow}>
              {video.duration ? (
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{video.duration}</Text>
                </View>
              ) : null}
              {video.file_size ? (
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{video.file_size}</Text>
                </View>
              ) : null}
              {video.language ? (
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{video.language}</Text>
                </View>
              ) : null}
              {video.video_id ? (
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{video.video_id}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loaderBox}>
          <Text style={styles.errorText}>Video not found.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default UserManualVideoScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.lightBg},
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerSpacer: {width: 24},
  content: {padding: 16, paddingBottom: 30},
  playerBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.black,
    borderRadius: 14,
    overflow: 'hidden',
  },
  video: {flex: 1, backgroundColor: Colors.black},
  webView: {flex: 1, backgroundColor: Colors.black},
  playerLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30},
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.denger,
    textAlign: 'center',
    marginTop: 14,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  videoTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  videoDesc: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkGray,
    lineHeight: 20,
    marginTop: 4,
  },
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12},
  metaChip: {
    backgroundColor: Colors.lightestGray,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaChipText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkGray,
  },
});
