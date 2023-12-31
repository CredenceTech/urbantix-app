import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StatusBar,
    StyleSheet,
} from "react-native";
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { login_background_color } from "../../constants/custome_colors";

import { store } from "../../state/store";

interface Prop {
    navigation: any;
}

const SplashScreen: React.FC<Prop> = ({ }) => {

    const navigation = useNavigation();

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
            const session = await EncryptedStorage.getItem("user_session");
            if (session !== undefined) {
                let userObj = JSON.parse(session);
                // Congrats! You've just retrieved your first value!
                if (userObj.user != null && userObj.user.access_token != null) {
                    navigation.navigate('Home');
                }
                else {
                    navigation.navigate('LoginScreen');
                }
            }
            else {
                navigation.navigate('LoginScreen');
            }
        } catch (error) {
            // There was an error on the native side
            navigation.navigate('LoginScreen');
        }
    }

    return (
        <View style={styles.MainView}>
            {/* <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" /> */}
            <Image
                source={require("../../assets/images/logo-header.png")}
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
        width: 300,
        height: 100,
        resizeMode: 'contain',
        marginVertical: 30,
    },
});

export default SplashScreen;