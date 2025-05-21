import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {Colors} from '../../utils/colors';

const LoadingScreen = () => {
  return (
    <View style={[styles.container]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: Colors.white,
    height: '100%',
  },
});

export default LoadingScreen;
