import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    TextInput,
    Dimensions,
} from "react-native";
import { LegendList } from "@legendapp/list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { background_color, black_color, blue_color, gray_color, primary_color, white_color } from "../../constants/custome_colors";
import { custome_screenContainer } from "../../constants/custome_styles";

import EventComponent from "../../components/EventComponent";
import Loader from "../../components/Loader";
import { api } from "../../constants/api_manager";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../state/slices/authenticationSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEvent } from "../../constants/services";
import debounce from 'lodash.debounce';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "../../components/BottomSheet";
import { ActivityIndicator } from 'react-native';

interface EventItem {
    id: string;
    name: string;
    place: string;
    start_date: string;
    total_sold: number;
    total_tickets: number;
    minimum_price: number;
}

interface FooterProps {
    isLoadingNextPage: boolean;
}

const FooterComponent: React.FC<FooterProps> = ({ isLoadingNextPage }) => {
    if (!isLoadingNextPage) {
        return null;
    }

    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={primary_color} />
        </View>
    );
};

const { height } = Dimensions.get('screen');
const PAGE_SIZE = 10;

const HomeScreen: React.FC = () => {
    const authentication = useSelector((state: any) => state.authentication);
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const [isLoading, setLoading] = useState(true);
    const [isLoadingNextPage, setLoadingNextPage] = useState(false);
    const [isSearchLoading, setSearchLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('Upcoming'); // Past,Upcoming,Draft
    const [arrayEvent, setArrayEvent] = useState<EventItem[]>([]);
    const [totalEvents, setTotalEvents] = useState(0);
    const [currentpage, setCurrentpage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const bottomSheetRef = useRef<any>(null);

    const pressHandler = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    // Memoize debounce handler to prevent recreation on every render
    const debouncedSearchHandler = useMemo(
        () => debounce((value: string) => {
            setDebouncedSearch(value);
        }, 500),
        []
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearchHandler.cancel();
        };
    }, [debouncedSearchHandler]);

    // Trigger debounced search when search changes
    useEffect(() => {
        debouncedSearchHandler(search);
    }, [search, debouncedSearchHandler]);

    // Fetch events when status or page changes
    useEffect(() => {
        getEvents();
    }, [status, currentpage]);

    // Reset page and fetch when debounced search changes
    useEffect(() => {
        if (currentpage === 1) {
            getEvents(true); // Pass true to indicate it's a search
        } else {
            setCurrentpage(1);
        }
    }, [debouncedSearch]);

    const nextPage = useCallback(() => {
        if (isLoading || isLoadingNextPage) return;
        // Check if there are more pages based on the total count from API
        const hasMorePages = totalEvents > currentpage * PAGE_SIZE;
        if (hasMorePages) {
            setCurrentpage(prev => prev + 1);
        }
    }, [isLoading, isLoadingNextPage, totalEvents, currentpage]);

    const searchValueChanged = (text: string) => {
        setSearch(text);
        if (text === '') {
            setArrayEvent([]);
        }
    };

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

    const getEvents = async (isSearch: boolean = false) => {
        // Determine if this is initial load, pagination, or search
        const isInitialLoad = currentpage === 1 && !isSearch;
        const isPagination = currentpage > 1;

        if (isInitialLoad) {
            setLoading(true);
        } else if (isPagination) {
            setLoadingNextPage(true);
        } else if (isSearch) {
            setSearchLoading(true);
        }

        const params = JSON.stringify({
            keyword: debouncedSearch,
            pageNumber: currentpage,
            pageSize: PAGE_SIZE,
            isLogin: true,
            isLike: false,
            userId: authentication?.user?.id,
            status: status
        });

        try {
            const result = await getEvent(params);

            console.log(result, "Result")

            if (result?.success) {
                // Extract pagination metadata from the response
                const count = result?.data?.count ?? 0;
                const currentPage = result?.data?.currentPage ?? currentpage;
                const perPage = result?.data?.perPage ?? PAGE_SIZE;

                setTotalEvents(count);

                if (result?.data?.events) {
                    if (currentpage === 1) {
                        setArrayEvent(result.data.events);
                    } else {
                        // Filter out duplicates when appending
                        const newEvents = result.data.events.filter((newEvent: EventItem) =>
                            !arrayEvent.some(existingEvent => existingEvent.id === newEvent.id)
                        );
                        if (newEvents.length > 0) {
                            setArrayEvent(prev => [...prev, ...newEvents]);
                        }
                    }
                } else {
                    if (currentpage === 1) {
                        setArrayEvent([]);
                    }
                }
            } else {
                Alert.alert("Error", result?.message || "Failed to fetch events");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch events");
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            } else if (isPagination) {
                setLoadingNextPage(false);
            } else if (isSearch) {
                setSearchLoading(false);
            }
        }
    };

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
                                    {isSearchLoading && (
                                        <ActivityIndicator
                                            size="small"
                                            color={primary_color}
                                            style={{ alignSelf: 'center', marginLeft: 10 }}
                                        />
                                    )}
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
                            {arrayEvent?.length > 0 ? (
                                <LegendList
                                    data={arrayEvent}
                                    renderItem={({ item }: { item: EventItem }) => (
                                        <EventComponent objEvent={item} actionOnRow={() => actionOnRow(item)} />
                                    )}
                                    keyExtractor={(item: EventItem) => item.id}
                                    showsVerticalScrollIndicator={false}
                                    onEndReached={({ distanceFromEnd }) => {
                                        if (distanceFromEnd < 0) return;
                                        nextPage();
                                    }}
                                    onEndReachedThreshold={0.5}
                                    estimatedItemSize={120}
                                    ListFooterComponent={() => <FooterComponent isLoadingNextPage={isLoadingNextPage} />}
                                />
                            ) : (
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={styles.notDataLable}>No Events Found!</Text>
                                </View>
                            )}
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