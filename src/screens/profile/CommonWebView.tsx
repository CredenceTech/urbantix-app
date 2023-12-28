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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { background_color, gray_color, primary_color, white_color, black_color } from "../../constants/custome_colors";
import { custome_screenContainer } from "../../constants/custome_styles";

import NavigationBar from "../../components/NavigationBar";
import Loader from "../../components/Loader";
import { useRoute } from "@react-navigation/native";
import WebView from "react-native-webview";

interface Prop {
    navigation: any;
}

const CommonWebView: React.FC<Prop> = ({ }) => {



    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute()

    //NAVIGATION PARAMS
    const strTitle: string = route.params?.title
    const strURL: string = route.params?.url
    //SCREEN PARAMS
    const [isLoading, setLoading] = useState(false);
    const [screenTitle, setScreenTitle] = useState('');
    const [screenURL, setScreenURL] = useState('');

    useEffect(() => {
        //
        setScreenTitle(strTitle)
        setScreenURL(strURL)
    }, [])

    const backClicked = async () => {
        navigation.goBack();
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
                    <NavigationBar isShowBack={true} backClicked={backClicked} isShowTitle={true} screenTitle={screenTitle} isShowLogout={false} />
                    <View style={styles.mainView}>
                        <WebView source={{ uri: screenURL }} style={{ flex: 1 }} />
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
    notDataLable: {
        fontSize: 18,
        fontWeight: '500',
        color: gray_color,
    },
});

export default CommonWebView;
