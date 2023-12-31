/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "./src/state/store";
import { SafeAreaProvider } from "react-native-safe-area-context";

//SCREENS START
import SplashScreen from './src/screens/common/SplashScreen';
import LoginScreen from './src/screens/login_registration/LoginScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import EventGuestsScreen from './src/screens/home/EventGuestsScreen';
//SCREENS END

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { primary_color } from './src/constants/custome_colors';
import HomePage from './src/screens/home/HomePage';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <Provider store={store}>
    <SafeAreaProvider>
    <NavigationContainer theme={MyTheme}  >
          <Stack.Navigator  screenOptions={headerStyle} >
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="EventGuestsScreen" component={EventGuestsScreen} />
          <Stack.Screen name="Home" component={HomePage} />
        </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

const headerStyle = {
  headerShown: false,
};

export const MyTheme = {
    dark: false,
    colors: {
      primary:  primary_color,
      background: 'white',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(28, 28, 30)',
      border: 'rgb(199, 199, 204)',
      notification: 'rgb(255, 69, 58)',
    },
  };

export default App;
