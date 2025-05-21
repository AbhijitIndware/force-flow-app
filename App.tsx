import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import MainScreen from './src/screens/MainScreen/MainScreen';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './src/store/store';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <MainScreen />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

export default App;
