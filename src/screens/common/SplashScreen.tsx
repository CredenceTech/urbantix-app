import React, { useEffect, useState } from "react";
import {
    View,
    Image,
    StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { login_background_color } from "../../constants/custome_colors";
const { height, width } = Dimensions.get('screen');
import { Dimensions } from "react-native";
import { useSelector } from "react-redux";

interface Prop {
    navigation: any;
}

const SplashScreen: React.FC<Prop> = ({ }) => {

    const navigation = useNavigation();
    const authentication = useSelector((state) => state.authentication)
    const [isFirstLaunch, setIsFirstLaunch] = useState(true)

      const getfirstLaunchData = async () => {
        try {
          const value = await AsyncStorage.getItem('alreadylaunch');
          if (value !== null) {
            retrieveUserSession();
          } else {
            navigation.navigate("OnBoardingScreen")
          }
        } catch (e) {
          // error reading value
        }
      };

    useEffect(() => {
        setTimeout(() => {
            getfirstLaunchData();
        }, 2000);
    }, [])

    async function retrieveUserSession() {
        try {
            if (authentication !== null) {
                if (authentication?.user != null && authentication?.user?.access_token != null) {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      });
                }
                else {
                    navigation.navigate('LoginLanding');
                }
            }
            else {
                navigation.navigate('LoginLanding');
            }
        } catch (error) {
            // There was an error on the native side
            navigation.navigate('LoginLanding');
        }
    }

    return (
        <View style={styles.MainView}>
            <Image
                source={require("../../assets/images/splash.jpg")}
                style={styles.logo}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    MainView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: login_background_color
    },
    logo: {
        width: width,
        height: height,
        // resizeMode: 'contain',
    },
});

export default SplashScreen;