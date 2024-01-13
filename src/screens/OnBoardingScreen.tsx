import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Linking, Platform, StatusBar, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { View, Image } from 'react-native';
import Swiper from 'react-native-swiper';
const { width, height } = Dimensions.get('window')
import Autolink from 'react-native-autolink';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


const Onboarding = ({ navigation }) => {
    const insets = useSafeAreaInsets();


    const onSkip = () => {
        navigation.replace("LoginLanding")
        AsyncStorage.setItem("alreadylaunch", "true")
    }

    const openURLInBrowser = (url) => {
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            {/* <Image source={require('.../assets/images/slide-1.jpg')} style={styles.imgBackground} /> */}
            <Swiper
                style={styles.wrapper}
                autoplay={true}
                dot={
                    <View
                        style={{
                            backgroundColor: 'rgba(255,255,255,.3)',
                            width: 7,
                            height: 7,
                            borderRadius: 7,
                            marginLeft: 7,
                            marginRight: 7,
                            marginBottom: 40
                        }}
                    />
                }
                activeDot={
                    <View
                        style={{
                            backgroundColor: '#D24545',
                            width: 7,
                            height: 7,
                            borderRadius: 7,
                            marginLeft: 7,
                            marginRight: 7,
                            marginBottom: 40
                        }}
                    />
                }
                paginationStyle={{
                    bottom: 70
                }}
            >
                <View style={styles.slide}>
                    <Image
                        style={{ width: "100%", height: "100%", objectFit: "fill" }}
                        source={require('../assets/images/slide-4.jpg')}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.slide}>
                    <Image
                        style={{ width: "100%", height: "100%", objectFit: "fill" }}
                        source={require('../assets/images/slide-1.jpg')}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.slide}>
                    <Image resizeMode="contain" style={{ width: "100%", height: "100%", objectFit: "fill" }} source={require('../assets/images/slide-3.jpg')} />
                </View>
                <View style={styles.slide}>
                    <Image resizeMode="contain" style={{ width: "100%", height: "100%", objectFit: "fill" }} source={require('../assets/images/slide-2.jpg')} />
                </View>
            </Swiper>

            <TouchableOpacity style={[styles.skipButton, {top: insets.top+10}]} onPress={onSkip}>
                <Text style={styles.skipButtonText}>SKIP</Text>
            </TouchableOpacity>

            {/* Sign In button */}
            <TouchableOpacity style={[styles.signInButton, {bottom: insets.bottom+55}]} onPress={onSkip}>
                <Text style={styles.signInButtonText}>Log In</Text>
            </TouchableOpacity>

            {/* Terms of Use / Privacy Policy */}
            <View style={[styles.termsPrivacyContainer, {bottom: insets.bottom}]}>
                <TouchableOpacity
                    style={styles.termsPrivacyButton}
                    onPress={() => openURLInBrowser('https://www.urbantixs.com/privacy-policy/terms-of-use')}
                >
                    <Autolink text='Terms of Use' style={styles.termsPrivacyText} />
                </TouchableOpacity>
                <Text style={styles.separator}>|</Text>
                <TouchableOpacity
                    style={styles.termsPrivacyButton}
                    onPress={() => openURLInBrowser('https://www.urbantixs.com/privacy-policy/privacy-policy')}
                >
                    <Autolink text='Privacy Policy' style={styles.termsPrivacyText} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = {
    wrapper: {
        // backgroundColor: '#f00'
    },
    slide: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    container: {
        flex: 1
    },

    imgBackground: {
        width,
        height,
        backgroundColor: 'transparent',
        position: 'absolute'
    },
    image: {
        width,
        height
    },
    skipButton: {
        position: 'absolute',
        // top: Platform.OS === "android" ? 20 : 70,
        right: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: 'rgba(28, 26, 23, 0.5)',
        opacity: "9",
        borderRadius: 20
    },
    skipButtonText: {
        color: 'white',
        fontSize: 16,
    },
    signInButton: {
        position: 'absolute',
        // bottom: Platform.OS === "android" ? 55 : 90,
        left: '62%', // Center horizontally
        transform: [{ translateX: -width * 0.25 }], // Adjust based on the button width
        backgroundColor: '#CBCBCD',
        paddingVertical: 7,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    signInButtonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: "500"
    },
    termsPrivacyContainer: {
        position: 'absolute',
        // bottom: Platform.OS === "android" ? 0 : 35,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    termsPrivacyButton: {
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    termsPrivacyText: {
        color: 'white',
        fontSize: 14,
    },
    separator: {
        color: 'white',
        fontSize: 14,
        marginHorizontal: 5,
    },
}

export default Onboarding;
