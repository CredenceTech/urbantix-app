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
import { useNavigation } from '@react-navigation/native';
import { background_color, black_color, blue_color, gray_color, primary_color, white_color } from "../../constants/custome_colors";
import { custome_screenContainer, custome_buttons, custome_textfields } from "../../constants/custome_styles";

import NavigationBar from "../../components/NavigationBar";
import EventComponent from "../../components/EventComponent";
import Loader from "../../components/Loader";
import { events_list } from "../../constants/api_constants";
import { postParamRequest } from "../../constants/api_manager";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../state/slices/authenticationSlice";


interface Prop {
    navigation: any;
}

const HomeScreen: React.FC<Prop> = ({ }) => {
    const authentication = useSelector((state) => state.authentication)
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isLoading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('Upcoming'); // Past,Upcoming,Draft
    const [arrayEvent, setArrayEvent] = useState([]);
    const [totalEvents, setTotalEvents] = useState(1);
    const [currentpage, setCurrentpage] = useState(1);


    useEffect(() => {
        getEvents();
    }, [status, currentpage])

    useEffect(() => {
        getEvents(false);
    }, [search])

    const nextPage = async () => {
        if (totalEvents > arrayEvent.length) {
            setCurrentpage(currentpage + 1)
            getEvents();
        }
    }

    const searchValueChanged = async (text: string = '') => {
        setSearch(text);
        setCurrentpage(1);
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

    const getEvents = async (showLoader: Boolean = true) => {
        if (showLoader == true) {
            setLoading(true);
        }

        //LOGIN API CALL
        var params = JSON.stringify({
            'keyword': search,
            'pageNumber': currentpage,
            'pageSize': 4,
            'isLogin': true,
            'isLike': false,
            'userId': authentication?.user?.id,
            'status': status
        })
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
                setTotalEvents(data.count);
                if (currentpage == 1) {
                    setArrayEvent(data.events);
                }
                else {
                    setArrayEvent(...arrayEvent, data.events);
                }
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
        navigation.navigate('LoginLanding');
        dispatch(removeUser())
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
                        <View style={{ flexDirection: "row", height: 50 }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: primary_color }} onPress={upcomingClicked}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: white_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Live Events</Text>
                                </View>
                                <View style={{ height: 3, backgroundColor: status == 'Upcoming' ? white_color : primary_color }} ></View>
                            </TouchableOpacity>
                            <View style={{ width: 3 }}></View>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: primary_color }} onPress={pastClicked}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: white_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Past Events</Text>
                                </View>
                                <View style={{ height: 3, backgroundColor: status == 'Past' ? white_color : primary_color }} ></View>
                            </TouchableOpacity>
                            <View style={{ width: 3 }}></View>
                            {/* <TouchableOpacity style={{ flex: 1, backgroundColor: primary_color }} onPress={draftClicked}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: white_color, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>Draft Events</Text>
                                </View>
                                <View style={{ height: 3, backgroundColor: status == 'Draft' ? white_color : primary_color }} ></View>
                            </TouchableOpacity> */}
                        </View>
                        {
                            arrayEvent.length > 0 ?
                                <FlatList
                                    data={arrayEvent}
                                    renderItem={({ item }) => <EventComponent objEvent={item} actionOnRow={() => actionOnRow(item)} />}
                                    keyExtractor={(item, index) => item.id}
                                    showsHorizontalScrollIndicator={false}
                                    onEndReached={({ distanceFromEnd }) => {
                                        if (distanceFromEnd < 0) return;
                                        nextPage()
                                    }} /> :
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
    search_image: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginVertical: 10,
        marginRight: 10,
        tintColor: primary_color
    },
});

export default HomeScreen;