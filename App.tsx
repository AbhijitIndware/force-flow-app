import React from 'react';
import {StatusBar, useColorScheme, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './src/store/store';
import MainNavigation from './src/screens/MainNavigation/MainNavigation';
import Toast from 'react-native-toast-message';
import {toastConfig} from './src/components/ui-lib/custom-toast';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import DisclaimerModal from './DisclaimerModal';
import {useNetworkStatus} from './src/hooks/useNetworkStatus';
import {SlowNetworkBanner} from './src/components/ui-lib/slow-network-banner';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const networkStatus = useNetworkStatus();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <PaperProvider>
            <View style={{flex: 1}}>
              <SlowNetworkBanner
                isVisible={networkStatus.isSlowNetwork}
                effectiveType={networkStatus.effectiveType}
              />
              <NavigationContainer>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                />
                <DisclaimerModal />
                <MainNavigation />
              </NavigationContainer>
            </View>
          </PaperProvider>
          <Toast config={toastConfig} />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
