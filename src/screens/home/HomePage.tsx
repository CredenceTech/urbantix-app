import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, BackHandler, Image, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import HomeScreen from './HomeScreen';
import Orders from './Orders';
import QRScanner from '../QRCodeScanner';
import UserProfile from '../profile/UserProfile';
import { primary_color } from '../../constants/custome_colors';
// import ProductIcon from "../assets/img/ProductIconSvg.svg"

const Tab = createBottomTabNavigator();

const HomePage = () => {
  const safeAreaInsets = useSafeAreaInsets();

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: Platform.OS === "android" ? 60 : (60 + safeAreaInsets.bottom),
          backgroundColor: "#3E8B2B",
          paddingBottom: safeAreaInsets.bottom,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          color: "white",
          fontSize: 14,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ padding: 3 }}>
              <Image
                source={require("../../assets/images/dashboard.png")}
                style={styles.search_image}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={Orders}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 3,
              }}
            >
              <Image
                source={require("../../assets/images/order.png")}
                style={styles.search_image}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Check In"
        component={QRScanner}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 3,
              }}
            >
              <Image
                source={require("../../assets/images/checkin.png")}
                style={styles.search_image}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      {/* <Tab.Screen
        name="User Profile"
        component={UserProfile}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 3,
              }}
            >
              <Image
                source={require("../../assets/images/userProfile.png")}
                style={styles.search_image}
              />
            </View>
          ),
          headerShown: false,
        }}
      /> */}
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({

  search_image: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginVertical: 10,
    marginRight: 10,
    tintColor: '#fff'
  },
});
export default HomePage;
