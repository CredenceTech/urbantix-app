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
import { background_color, black_color, blue_color, gray_color, primary_color, white_color } from "../../constants/custome_colors";
import { custome_screenContainer, custome_buttons, custome_textfields } from "../../constants/custome_styles";

import NavigationBar from "../../components/NavigationBar";
import EventComponent from "../../components/EventComponent";
import Loader from "../../components/Loader";
import { events_list } from "../../constants/api_constants";
import { api, postParamRequest } from "../../constants/api_manager";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../state/slices/authenticationSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEvent } from "../../constants/services";
import debounce from 'lodash.debounce';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "../../components/BottomSheet";
interface Prop {
    navigation: any;
}
const { height } = Dimensions.get('screen');

const HomeScreen: React.FC<Prop> = ({ }) => {
    const authentication = useSelector((state) => state.authentication)
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isLoading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('Upcoming'); // Past,Upcoming,Draft
    const [arrayEvent, setArrayEvent] = useState([]);
    const [totalEvents, setTotalEvents] = useState(0);
    const [currentpage, setCurrentpage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const bottomSheetRef = useRef();
    const pressHandler = useCallback(() => {
        bottomSheetRef.current.expand();
    }, []);


    useEffect(() => {
        getEvents();
    }, [status, currentpage])

    const debouncedSearchHandler = debounce((value: string) => {
        setDebouncedSearch(value);
    }, 1500);

    useEffect(() => {
        debouncedSearchHandler(search);
        return () => {
            debouncedSearchHandler.cancel();
        };
    }, [search]);

    useEffect(() => {
        setCurrentpage(1);
        getEvents();
    }, [debouncedSearch]);

    const nextPage = async () => {
        if (isLoading) return;
        if (totalEvents > arrayEvent?.length && currentpage < Math.ceil(totalEvents / 4)) {
            setCurrentpage(prev => prev + 1)
            // await getEvents();
        }
    }

    const searchValueChanged = async (text: string = '') => {
        setSearch(text);
        setArrayEvent([]);
    }

    const upcomingClicked = () => {
        if (status != 'Upcoming') {
            setStatus('Upcoming');
            setSearch('');
            setCurrentpage(1);
        }
    }

    const pastClicked = () => {
        if (status != 'Past') {
            setStatus('Past');
            setSearch('');
            setCurrentpage(1);
        }
    }

    const draftClicked = () => {
        if (status != 'Draft') {
            setStatus('Draft');
            setSearch('');
            setCurrentpage(1);
        }
    }

    const getEvents = async () => {
        setLoading(true);
        let params = JSON.stringify({
            'keyword': search,
            'pageNumber': currentpage,
            'pageSize': 4,
            'isLogin': true,
            'isLike': false,
            'userId': authentication?.user?.id,
            'status': status
        })
        console.log("paramsparamsparams", params)
        const result = await getEvent(params);
        setLoading(false);
        console.log("data", result)
        if (result?.success) {
            if (result?.data) {
                if (result?.data?.count != totalEvents) {
                    setTotalEvents(result?.data?.count);
                }
                // setTotalEvents(result?.data?.count);
            }
            if (result?.data?.events) {
                if (currentpage === 1) {
                    if (result?.data?.events.length > 0) {
                        setArrayEvent(result?.data?.events);
                    }
                } else {
                    setLoading(true);
                    const newEvents = result?.data?.events.filter(newEvent =>
                        !arrayEvent.some(existingEvent => existingEvent.id === newEvent.id)
                    );
                    if (newEvents.length > 0) {
                        setArrayEvent(prevHistory => [...prevHistory, ...newEvents]);
                    }
                    setLoading(false);
                }
            } else {
                setArrayEvent([]);
                setCurrentpage(1);
            }

        } else {
            Alert.alert("Error", result?.message);
            // setArrayEvent([]);
        }
    }

    const backClicked = async () => {
        navigation.goBack();
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

    const actionOnRow = (item: any) => {
        navigation.navigate('EventGuestsScreen', { objEvent: item });
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

                            <View style={{ flexDirection: "row", height: 50 }}>
                                <TouchableOpacity style={{ flex: 1, backgroundColor: primary_color, }} onPress={upcomingClicked}>
                                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                        <Text style={{ color: white_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Live Events</Text>
                                    </View>
                                    <View style={{ height: 3, backgroundColor: status == 'Upcoming' ? white_color : primary_color }} ></View>
                                </TouchableOpacity>
                                <View style={{ width: 3 }}></View>
                                <TouchableOpacity style={{ flex: 1, backgroundColor: primary_color, }} onPress={pastClicked}>
                                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                        <Text style={{ color: white_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Past Events</Text>
                                    </View>
                                    <View style={{ height: 3, backgroundColor: status == 'Past' ? white_color : primary_color }} ></View>
                                </TouchableOpacity>
                                {/* <View style={{ width: 3 }}></View> */}
                                {/* <TouchableOpacity style={{ flex: 1, backgroundColor: primary_color }} onPress={draftClicked}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: white_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Draft Events</Text>
                                </View>
                                <View style={{ height: 3, backgroundColor: status == 'Draft' ? white_color : primary_color }} ></View>
                            </TouchableOpacity> */}
                            </View>
                            {
                                arrayEvent?.length > 0 ?
                                    <FlatList
                                        data={arrayEvent}
                                        renderItem={({ item }) => <EventComponent objEvent={item} actionOnRow={() => actionOnRow(item)} />}
                                        keyExtractor={(item, index) => index.toString()}
                                        showsHorizontalScrollIndicator={false}
                                        onEndReached={({ distanceFromEnd }) => {
                                            if (distanceFromEnd < 0) return;
                                            nextPage()
                                        }} />
                                    :
                                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                        <Text style={styles.notDataLable}>No Events Found!</Text>
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
                                            <Text style={styles.buttonText}>Delete Account</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </BottomSheet>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        </GestureHandlerRootView>
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
    search_image: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginVertical: 10,
        marginRight: 10,
        tintColor: primary_color
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

export default HomeScreen;