import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StatusBar,
    StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { login_background_color } from "../../constants/custome_colors";
const { height, width } = Dimensions.get('screen');

import { store } from "../../state/store";
import { Dimensions } from "react-native";
import { useSelector } from "react-redux";

interface Prop {
    navigation: any;
}

const SplashScreen: React.FC<Prop> = ({ }) => {

    const navigation = useNavigation();
    const authentication = useSelector((state) => state.authentication)
    useEffect(() => {
        //NAVIGATE AFTER 2 SECONDS
        setTimeout(() => {

            retrieveUserSession();

            // const persistValue = store.getState().authentication;
            // if (persistValue != null && persistValue.user != null) {
            //     navigation.navigate('HomeScreen');
            // }
            // else {
            //     navigation.navigate('LoginScreen');
            // }
        }, 2000);
    }, [])

    async function retrieveUserSession() {
        try {
            if (authentication !== null) {
                // Congrats! You've just retrieved your first value!
                if (authentication?.user != null && authentication?.user?.access_token != null) {
                    navigation.navigate('Home');
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
            {/* <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" /> */}
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