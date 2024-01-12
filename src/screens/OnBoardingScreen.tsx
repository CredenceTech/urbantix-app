import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { Dimensions } from 'react-native';
import { Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
const { height, width } = Dimensions.get('window');

const OnBoardingScreen = () => {
    const navigation = useNavigation()
    return (
        <Onboarding
            onSkip={() => {
                navigation.replace("LoginLanding")
                AsyncStorage.setItem("alreadylaunch", "true")
            }}
            onDone={() => {
                navigation.replace("LoginLanding")
                AsyncStorage.setItem("alreadylaunch", "true")
            }}
            pages={[
                {
                    backgroundColor: 'green',
                    image: <Image style={{ height: "100%", width: "100%", objectFit: 'fill', }} source={require('../assets/images/slide-4.jpg')} />,
                    // title: '',
                    // subtitle: '',
                },
                {
                    backgroundColor: 'green',
                    image: <Image style={{ height: "100%", width: "100%", objectFit: 'fill', }} source={require('../assets/images/slide-1.jpg')} />,
                    // title: '',
                    // subtitle: '',
                },
                {
                    backgroundColor: 'green',
                    image: <Image style={{ height: "100%", width: "100%", objectFit: 'fill', }} source={require('../assets/images/slide-3.jpg')} />,
                    // title: '',
                    // subtitle: '',
                },
                {
                    backgroundColor: 'green',
                    image: <Image style={{ height: "100%", width: "100%", objectFit: 'fill', }} source={require('../assets/images/slide-2.jpg')} />,
                    // title: '',
                    // subtitle: '',
                },
            ]}
        />
    )
}

export default OnBoardingScreen