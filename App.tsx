/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "./src/state/store";
import { SafeAreaProvider } from "react-native-safe-area-context";

//SCREENS START
import SplashScreen from './src/screens/common/SplashScreen';
import LoginLanding from './src/screens/login_registration/LoginLanding';
import HomeScreen from './src/screens/home/HomeScreen';
import EventGuestsScreen from './src/screens/home/EventGuestsScreen';
import { Settings } from 'react-native-fbsdk-next';
import CommonWebView from './src/screens/profile/CommonWebView';
//SCREENS END

import { primary_color } from './src/constants/custome_colors';
import HomePage from './src/screens/home/HomePage';
import Orders from './src/screens/home/Orders';
import QRScanner from './src/screens/QRCodeScanner';
import { PersistGate } from 'redux-persist/integration/react';
import persistStore from 'redux-persist/es/persistStore';
import OnBoardingScreen from './src/screens/OnBoardingScreen';

const Stack = createNativeStackNavigator();

function App() {
  let persistor = persistStore(store);

  useEffect(() => {
    Settings.setAdvertiserTrackingEnabled(true);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer theme={MyTheme}  >
            <Stack.Navigator screenOptions={headerStyle} >
              <Stack.Screen name="SplashScreen" component={SplashScreen} />
              <Stack.Screen name="OnBoardingScreen" options={{ headerShown: false }} component={OnBoardingScreen} />
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="LoginLanding" component={LoginLanding} />
              <Stack.Screen name="EventGuestsScreen" component={EventGuestsScreen} />
              <Stack.Screen name="Home" component={HomePage} />
              <Stack.Screen name="Orders" component={Orders} />
              <Stack.Screen name="CheckIn" component={QRScanner} />
              <Stack.Screen name="CommonWebView" component={CommonWebView} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const headerStyle = {
  headerShown: false,
};

export const MyTheme = {
  dark: false,
  colors: {
    primary: primary_color,
    background: 'white',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(199, 199, 204)',
    notification: 'rgb(255, 69, 58)',
  },
};

export default App;
