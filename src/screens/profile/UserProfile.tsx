import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StatusBar,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';
import { background_color, gray_color, primary_color, white_color, black_color, blue_color } from "../../constants/custome_colors";
import { custome_screenContainer } from "../../constants/custome_styles";

import Loader from "../../components/Loader";
import { useRoute } from "@react-navigation/native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

interface Prop {
    navigation: any;
}

const UserProfile: React.FC<Prop> = ({ }) => {

    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute()

    //NAVIGATION PARAMS
    //SCREEN PARAMS
    const [isLoading, setLoading] = useState(false);

    const [userName, setUserName] = useState('-');

    useEffect(() => {
        getUserName();
    }, [])

    const getUserName = async () => {
        var userName = '';

        try {
            const session = await EncryptedStorage.getItem("user_session");
            if (session !== undefined) {
                let userObj = JSON.parse(session);
                if (userObj.user != null && userObj.user != undefined) {
                    if (userObj.user.first_name != undefined && userObj.user.first_name != null) {
                        userName = userObj.user.first_name;
                    }
                    if (userObj.user.last_name != undefined && userObj.user.last_name != null) {
                        if (userName != '') {
                            userName = userName + ' ' + userObj.user.last_name;
                        }
                        else {
                            userName = userObj.user.last_name;
                        }
                    }
                }
            }
        } catch (error) {
            // There was an error on the native side
        }

        setUserName(userName);
    }

    const aboutUsClicked = async () => {
        navigation.navigate('CommonWebView', { title: 'About Us', url: 'https://www.urbantixs.com/about-us' });
    }

    const contactUsClicked = async () => {
        navigation.navigate('CommonWebView', { title: 'Contact Us', url: 'https://www.urbantixs.com/contact-us' });
    }

    const privacyPolicyClicked = async () => {
        navigation.navigate('CommonWebView', { title: 'Privact Policy', url: 'https://www.urbantixs.com/privacy-policy/privacy-policy' });
    }

    const termsOfUseClicked = async () => {
        navigation.navigate('CommonWebView', { title: 'Terms of Use', url: 'https://www.urbantixs.com/privacy-policy/terms-of-use' });
    }

    const editProfileClicked = async () => {
    }

    const logOutClicked = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'OK',
                onPress: () => { userLogout() },
                style: 'default',
            },
        ]);
    }

    const userLogout = async () => {
        await GoogleSignin.signOut();
        removeUserSession();
        navigation.navigate('LoginLanding');

    }

    async function removeUserSession() {
        try {
            await EncryptedStorage.removeItem("user_session");
            // Congrats! You've just removed your first value!
        } catch (error) {
            // There was an error on the native side
        }
    }

    const ElementComponent = ({title}) => {
        return <View style={styles.element}>
            <Text style={styles.element_text}>{title}</Text>
            <Image
                source={require("../../assets/images/next.png")}
                style={styles.element_image}
            />
        </View>
    }

    return (
        <View style={custome_screenContainer.view_container}>
            <Loader isLoading={isLoading} />
            <View style={{ backgroundColor: primary_color, height: safeAreaInsets.top }}>
                <StatusBar backgroundColor='#3e8b2b' barStyle="light-content" />
            </View>
            <SafeAreaView style={styles.SafeAreaView}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <View style={styles.mainView}>
                        <View style={{ flex: 1, padding: 10 }}>
                            <TouchableOpacity onPress={aboutUsClicked}>
                                <ElementComponent title="About Us"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={contactUsClicked}>
                                <ElementComponent title="Contact Us"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={privacyPolicyClicked}>
                                <ElementComponent title="Privacy Policy"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={termsOfUseClicked}>
                                <ElementComponent title="Terms of Use"/>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: "row", height: 50 }}>
                            <TouchableOpacity style={{ flex: 1, paddingHorizontal: 20 }} onPress={editProfileClicked}>
                                <View style={{ flex: 1, justifyContent: "center" }}>
                                    <Text style={{ color: white_color, textAlign: "left", fontSize: 14, fontWeight: "bold" }}>{userName}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: 130 }} onPress={logOutClicked}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: blue_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Log me out</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    SafeAreaView: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: background_color
    },
    mainView: {
        flex: 1,
        // alignItems: 'center',
        backgroundColor: background_color
    },
    element: {
        backgroundColor: black_color,
        height: 50,
        paddingHorizontal: 10,
        alignItems: "center",
        flexDirection: "row",
        borderBottomWidth: 2,
        borderBottomColor: gray_color,
    },
    element_text: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: white_color,
    },
    element_image: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
        tintColor: white_color
    },
});

export default UserProfile;