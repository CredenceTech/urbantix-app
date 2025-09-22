import React, { useCallback, useEffect, useRef, useState } from "react";
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
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { background_color, black_color, blue_color, gray_color, green_color, primary_color, white_color } from "../../constants/custome_colors";
import { custome_screenContainer } from "../../constants/custome_styles";
import moment from 'moment';
import Loader from "../../components/Loader";
import { ordersUrl } from "../../constants/api_constants";
import { api, getParamRequest, } from "../../constants/api_manager";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../state/slices/authenticationSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "../../components/BottomSheet";
import axios from "axios";
const { height } = Dimensions.get('screen');

interface Prop {
    navigation: any;
}

const Orders = () => {
    const authentication = useSelector((state) => state.authentication)
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isLoading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [arrayEvent, setArrayEvent] = useState([]);
    const [totalEvents, setTotalEvents] = useState(1);
    const [currentpage, setCurrentpage] = useState(1);

    const bottomSheetRef = useRef();
    const pressHandler = useCallback(() => {
        bottomSheetRef.current.expand();
    }, []);

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

    const userLogout = async () => {
        navigation.navigate('OnBoardingScreen');
        await AsyncStorage.removeItem('alreadylaunch');
        dispatch(removeUser())
    }

    const handleDeleteAccount = async () => {

        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => bottomSheetRef.current.close()
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await api.post('user/delete', {}, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${authentication?.user?.access_token}`
                                }
                            });

                            console.log(response, "Response")
                            
                            if (response.status === 200) {
                                Alert.alert('Success', 'Your account has been deleted successfully.');
                                // Perform logout actions
                                await userLogout();
                            } else {
                                Alert.alert('Error', 'Failed to delete account. Please try again later.');
                            }
                        } catch (error) {
                            console.error('Error deleting account:', error);
                            Alert.alert('Error', 'An error occurred while deleting your account. Please try again later.');
                        } finally {
                            bottomSheetRef.current.close();
                        }
                    }
                }
            ]
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                            <View style={{ flexDirection: "row", }}>
                                <View style={{ width: `${(Platform.OS === "ios") ? "87%" : "100%"}`, flexDirection: "row", backgroundColor: white_color, paddingHorizontal: 10, paddingVertical: 5, height: 50 }}>
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
                                <TouchableOpacity onPress={pressHandler} activeOpacity={0.7} style={{ width: `${(Platform.OS === "ios") ? "13%" : "0%"}`, flexDirection: "row", backgroundColor: primary_color, paddingHorizontal: 10, paddingVertical: 5, height: 50 }}>
                                    <Image
                                        source={require("../../assets/images/setting.png")}
                                        style={styles.setting_img}
                                    />
                                </TouchableOpacity>
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
                                                        <Text style={styles.event_datetime}>{moment(moment(item?.created_at, 'YYYY-MM-DD HH:mm:ss.ZZZ')).format('ll')}</Text>
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
                                    <Text style={{ color: white_color, textAlign: "left", fontSize: 14, fontWeight: "bold" }}>{`${authentication?.user?.first_name} ${authentication?.user?.last_name}`}</Text>
                                </View>
                                <TouchableOpacity style={{ width: 130 }} onPress={logOutClicked}>
                                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                        <Text style={{ color: blue_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Log me out</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <BottomSheet
                            ref={bottomSheetRef}
                            activeHeight={height * 0.4}
                            backgroundColor={'#DAD3C8'}
                            backDropColor={'black'}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'space-between',
                                }}>
                                <View>
                                    <View>
                                        <TouchableOpacity onPress={handleDeleteAccount} activeOpacity={0.8} style={styles.button}>
                                            <Text style={styles.buttonText}>Delete Account Request</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </BottomSheet>
                    </KeyboardAvoidingView >
                </SafeAreaView >
            </View >
        </GestureHandlerRootView>
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

    setting_img: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
        marginVertical: 5,
        marginRight: 5,
        tintColor: black_color
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#000000',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        color: '#DAD3C8',
        fontSize: 18
    },
});
