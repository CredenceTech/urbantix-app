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
    TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';
import { background_color, black_color, blue_color, gray_color, green_color, primary_color, white_color } from "../../constants/custome_colors";
import { custome_screenContainer } from "../../constants/custome_styles";
import moment from 'moment';
import Loader from "../../components/Loader";
import { ordersUrl } from "../../constants/api_constants";
import { getParamRequest, } from "../../constants/api_manager";


interface Prop {
    navigation: any;
}

const Orders = () => {

    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [arrayEvent, setArrayEvent] = useState([]);
    const [totalEvents, setTotalEvents] = useState(1);
    const [currentpage, setCurrentpage] = useState(1);

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


    useEffect(() => {
        getOrdersList();
    }, [])

    const searchValueChanged = async (text: string = '') => {
        setSearch(text);
        setCurrentpage(1);
    }


    const getOrdersList = async (showLoader: Boolean = true) => {
        if (showLoader == true) {
            setLoading(true);
        }
        let apiUrl = ordersUrl;
        const [success, message, data, error]: any = await getParamRequest(apiUrl);
        if (error != null) {
            Alert.alert("Error", error);
            setArrayEvent([]);
        }
        else if (success == false || data == null) {
            setArrayEvent([]);
            Alert.alert("Failed", message);
        }
        else {
            if (data) {
                setArrayEvent(data)
            }
            else {
                setArrayEvent([]);
            }
        }
        setLoading(false);
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

    const userLogout = () => {
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
                    {/* <NavigationBar isShowBack={false} backClicked={backClicked} isShowTitle={true} screenTitle={'Event List'} isShowLogout={false} logOutClicked={logOutClicked} /> */}
                    <View style={styles.mainView}>
                        <View style={{ flexDirection: "row", backgroundColor: white_color, paddingHorizontal: 10, paddingVertical: 5, height: 50 }}>
                            <Image
                                source={require("../../assets/images/search.png")}
                                style={styles.search_image}
                            />
                            <TextInput
                                style={{ fontSize: 14, fontWeight: "normal", color: black_color, flex: 1 }}
                                placeholder="Search"
                                placeholderTextColor='#808080'
                                onChangeText={(text) =>
                                    searchValueChanged(text)
                                }
                                value={search} />
                        </View>
                        {
                            arrayEvent.length > 0 ?
                                <FlatList
                                    data={arrayEvent}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }: any) => {
                                        return (
                                            <View style={styles.main_view}>
                                                <Text style={styles.event_title}>{`${item?.user?.first_name} ${item?.user?.last_name}`}</Text>
                                                <View style={{ flexDirection: "row", marginTop: 5, marginBottom: 5 }}>
                                                    <Text style={styles.event_datetime}>{item?.user?.email}</Text>
                                                    <View style={{ flex: 1 }} />
                                                    <Text style={styles.event_datetime}>{moment(moment(item?.created_at, 'YYYY-MM-DD HH:mm:ss.ZZZ')).format('L')}</Text>
                                                </View>
                                                {/* <View style={[{ flexDirection: "row" }]}>
                                                    <Text style={styles.event_datetime}>Order # {item?.orderNumber}</Text>
                                                    <View style={{ flex: 1 }} />
                                                    <Text style={[styles.event_datetime, { paddingBottom: 4 }]}>{item?.payment}</Text>
                                                </View> */}
                                                <View style={[{ flexDirection: "row", borderBottomWidth: 2, borderBottomColor: green_color }]}>
                                                    <Text style={styles.event_datetime}></Text>
                                                    <View style={{ flex: 1 }} />
                                                    <Text style={[styles.event_datetime, { paddingBottom: 4 }]}>$ {item?.total_amount}</Text>
                                                </View>
                                            </View>
                                        )
                                    }}
                                    keyExtractor={(item, index) => index}
                                /> :
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={styles.notDataLable}>No Orders Found!</Text>
                                </View>
                        }
                        <View style={{ flexDirection: "row", height: 50 }}>
                            <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
                                <Text style={{ color: white_color, textAlign: "left", fontSize: 14, fontWeight: "bold" }}>{userName}</Text>
                            </View>
                            <TouchableOpacity style={{ width: 130 }} onPress={logOutClicked}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: blue_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Log me out</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView >
            </SafeAreaView >
        </View >
    )
}

export default Orders;

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
    search_image: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginVertical: 10,
        marginRight: 10,
        tintColor: primary_color
    },
    main_view: {
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 10,
        flexDirection: "column",
        backgroundColor: black_color,
    },
    event_title: {
        paddingVertical: 2,
        fontSize: 24,
        fontWeight: "bold",
        color: white_color,
    },
    event_address: {
        paddingVertical: 2,
        fontSize: 14,
        fontWeight: "normal",
        color: white_color,
    },
    event_datetime: {
        fontSize: 14,
        fontWeight: "normal",
        color: white_color,
    },
});
