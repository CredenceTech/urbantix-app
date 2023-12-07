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
import EventComponent from "../../components/EventComponent";
import Loader from "../../components/Loader";
import { events_list } from "../../constants/api_constants";
import { postParamRequest } from "../../constants/api_manager";

interface Prop {
    navigation: any;
}

const HomeScreen: React.FC<Prop> = ({ }) => {

    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('Draft'); // Past,Upcoming,Draft
    const [arrayEvent, setArrayEvent] = useState([]);
    const [totalpages, setTotalpages] = useState(1);
    const [currentpage, setCurrentpage] = useState(1);

    useEffect(() => {
        setCurrentpage(1)
        getEvents();
    }, [])

    const nextPage = () => {
        if (totalpages > currentpage) {
            setCurrentpage(currentpage + 1)
            getEvents();
        }
    }

    const getEvents = async () => {
        setLoading(true);

        var userID = '';

        try {
            const session = await EncryptedStorage.getItem("user_session");
            if (session !== undefined) {
                let userObj = JSON.parse(session);
                if (userObj.user != null && userObj.user.id != null) {
                    userID = userObj.user.id;
                }
            }
        } catch (error) {
            // There was an error on the native side
        }

        //LOGIN API CALL
        var params = JSON.stringify({
            'keyword': search,
            'pageNumber': currentpage,
            'pageSize': 10,
            'isLogin': true,
            'isLike': false,
            'userId': userID,
            'status': status
        })
        console.log('====================================');
        console.log(params);
        console.log('====================================');
        const [success, message, data, error] = await postParamRequest(events_list, params);
        if (error != null) {
            Alert.alert("Error", error);
            setArrayEvent([]);
        }
        else if (success == false || data == null) {
            setArrayEvent([]);
            Alert.alert("Failed", message);
        }
        else {
            if (data && data !== undefined && data !== null && data.events !== undefined && data.events !== null) {
                if (currentpage == 1) {
                    setArrayEvent(data.events);
                }
                else {
                    //setArrayEvent(arrayEvent => [...arrayEvent, ...data.events[1]]);
                }

                console.log('====================================');
                console.log(arrayEvent.length);
                console.log('====================================');
            }
            else {
                setArrayEvent([]);
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

    const actionOnRow = (item: any) => {
        navigation.navigate('EventGuestsScreen', { objEvent: item });

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
                    <NavigationBar isShowBack={false} backClicked={backClicked} isShowTitle={true} screenTitle={'Event List'} isShowLogout={true} logOutClicked={logOutClicked} />
                    <View style={styles.mainView}>
                        {
                            arrayEvent.length > 0 ?
                                <FlatList
                                    data={arrayEvent}
                                    renderItem={({ item }) => <EventComponent objEvent={item} actionOnRow={() => actionOnRow(item)} />}
                                    keyExtractor={(item, index) => item.id}
                                    onEndReached={({ distanceFromEnd }) => {
                                        if (distanceFromEnd < 0) return;
                                        nextPage()
                                    }} /> :
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={styles.notDataLable}>No Events Found!</Text>
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

export default HomeScreen;