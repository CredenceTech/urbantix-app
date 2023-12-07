import React from 'react';
import {
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    View,
    FlatList,
    StyleSheet,
    Text,
    StatusBar,
} from 'react-native';
import { background_color, green_color, login_background_color } from "../../constants/custome_colors";
import { Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
const { height, width } = Dimensions.get('screen');


const App = () => {

    const navigation = useNavigation();
    return (
        <SafeAreaView>
            {/* <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" /> */}
            <ScrollView >
                <View style={{
                    flex: 1,
                    backgroundColor: background_color,
                    height: height * 1,
                    paddingHorizontal: width * 0.1,
                    paddingTop: height * 0.05,
                    // justifyContent: 'space-between'
                    // paddingVertical: height * 0.05,
                }}>
                    <View style={{ marginBottom: height * 0.25 }}>
                        <Text style={{ color: '#FFF', fontSize: 44, fontWeight: 'bold' }}>
                            Let's Get You Logged In
                        </Text>
                        <Text style={{ color: '#FFF', marginTop: 10, fontWeight: '500' }}>
                            Please log-in to your account with one of the options presented below.
                        </Text>
                    </View>
                    <View>
                        <View style={{ marginBottom: 20 }}>
                            <TouchableOpacity
                                style={[styles.buttonItem, { paddingVertical: height * 0.016 }]}
                                onPress={() => {
                                    navigation.navigate('LoginScreen')
                                }}
                            >
                                <Text
                                    style={[styles.title]}
                                >
                                    Log-in with e-mail address
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <TouchableOpacity
                                style={[styles.buttonItem, { paddingVertical: height * 0.016 }]}
                                onPress={() => { }}
                            >
                                <Text
                                    style={[styles.title]}
                                >
                                    Continue with Apple ID
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <TouchableOpacity
                                style={[styles.buttonItem, { paddingVertical: height * 0.016 }]}
                                onPress={() => { }}
                            >
                                <Text
                                    style={[styles.title]}
                                >
                                    Continue with Google
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <TouchableOpacity
                                style={[styles.buttonItem, { paddingVertical: height * 0.016 }]}
                                onPress={() => { }}
                            >
                                <Text
                                    style={[styles.title]}
                                >
                                    Continue with Facebook
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    buttonItem: {
        backgroundColor: green_color,
        borderRadius: 12,
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#FFF"
    },
});

export default App;