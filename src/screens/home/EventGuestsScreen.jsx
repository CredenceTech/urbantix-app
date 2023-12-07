import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';
import { background_color, gray_color, primary_color } from "../../constants/custome_colors";
import { custome_screenContainer, custome_buttons, custome_textfields } from "../../constants/custome_styles";

import NavigationBar from "../../components/NavigationBar";
import EventGuestComponent from "../../components/EventGuestComponent";
import Loader from "../../components/Loader";
import { event_checkedin_list } from "../../constants/api_constants";
import { getParamRequest } from "../../constants/api_manager";
import moment from 'moment';
import { useRoute } from "@react-navigation/native";

interface Prop {
    navigation: any;
}

const EventGuestsScreen: React.FC<Prop> = ({ }) => {



    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute()
    //NAVIGATION PARAMS
    const objEvent = route.params?.objEvent
    //SCREEN PARAMS
    const [isLoading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [arrayEventGuests, setArrayEventGuests] = useState([]);
    const [totalpages, setTotalpages] = useState(1);
    const [currentpage, setCurrentpage] = useState(1);

    useEffect(() => {
        console.log('====================================');
        console.log("this.props.objEvent");
        console.log(objEvent);
        console.log('====================================');
        setCurrentpage(1)
        getEventGuests();
    }, [])

    const nextPage = () => {
        if (totalpages > currentpage) {
            setCurrentpage(currentpage + 1)
            getEventGuests();
        }
    }

    const getEventGuests = async () => {
        setLoading(true);

        var date = moment().format('YYYY-MM-DD HH:mm:ss'); //Current Date

        //LOGIN API CALL
        let apiEndpoint = event_checkedin_list + '/' + objEvent.id + '/' + 'transactions?keyword=' + search + '&pageNumber=' + currentpage + '&pageSize=10'
        console.log('====================================');
        console.log(apiEndpoint);
        console.log('====================================');
        const [success, message, data, error] = await getParamRequest(apiEndpoint);
        if (error !== null) {
            Alert.alert("Error", error);
        }
        else {
            if (success == false || data == null) {
                Alert.alert("Failed", message);
            }
            else {
                if (data && data !== undefined && data !== null) {
                    if (currentpage == 1) {
                        setArrayEventGuests(data);
                    }
                    else {
                        setArrayEventGuests(arrayEventGuests => [...arrayEventGuests, ...data[1]]);
                    }

                    console.log('====================================');
                    console.log(arrayEventGuests.length);
                    console.log('====================================');
                }
            }
        }
        setLoading(false);
    }

    const backClicked = async () => {
        navigation.goBack();
    }

    const logOutClicked = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'OK',
                onPress: () => { userLogout() },
                style: 'default',
            },
        ]);
    }

    const userLogout = () => {
        console.log('OK Pressed');
        removeUserSession();
        navigation.navigate('LoginScreen');

    }

    async function removeUserSession() {
        try {
            await EncryptedStorage.removeItem("user_session");
            // Congrats! You've just removed your first value!
        } catch (error) {
            // There was an error on the native side
        }
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
                    <NavigationBar isShowBack={true} backClicked={backClicked} isShowTitle={true} screenTitle={'Guest List'} isShowLogout={false} logOutClicked={logOutClicked} />
                    <View style={styles.mainView}>
                        {
                            arrayEventGuests.length > 0 ?
                                <FlatList
                                    data={arrayEventGuests}
                                    renderItem={({ item }) => <EventGuestComponent objEventGuest={item} />}
                                    onEndReached={({ distanceFromEnd }) => {
                                        if (distanceFromEnd < 0) return;
                                        nextPage()
                                    }} /> :
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={styles.notDataLable}>No Guests Found!</Text>
                                </View>
                        }
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

export default EventGuestsScreen;