import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { Button } from 'react-native-elements';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import Loader from './../../components/Loader'
import { black_color, gray_color, login_background_color, primary_color } from "../../constants/custome_colors";
import { custome_buttons, custome_textfields } from "../../constants/custome_styles";

import { login } from "../../constants/api_constants";
import { postParamRequest } from "../../constants/api_manager";
import PrimaryTextInput from "../../components/PrimaryTextInput";

interface Prop {
    navigation: any;
}

interface InputValue {
    email: string;
    password: string;
}

const LoginScreen: React.FC<Prop> = ({ }) => {

    const [isShowPassword, setShowPassword] = useState(false);
    // const [inputValue, setInputValue] = useState<InputValue>({
    //     email: "mayank.credencetech@gmail.com",
    //     password: "!znJw0}]",
    // });
    const [inputValue, setInputValue] = useState<InputValue>({
        email: "",
        password: "",
    });
    const [dataFromChild, setDataFromChild] = useState("");

    const [isLoading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        setLoading(true);
        //CHECK FOR USER SESSION
        setLoading(false);
    }, [])

    const onValueChanged = (e) => {
        setDataFromChild(e);
    };

    const showPasswordClicked = async () => {
        setShowPassword(!isShowPassword)
    }

    const cancelClicked = async () => {
        navigation.goBack()
    }

    const logInClicked = async () => {
        setLoading(true);
        // Check if email or password is empty
        if (!inputValue.email || !inputValue.password) {
            Alert.alert("Validation Error", "Both email and password fields are required");
            setLoading(false);
            return;
        }
        // Regular expression to validate email format
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(inputValue.email)) {
            Alert.alert("Validation Error", "Please enter a valid email address");
            setLoading(false);
            return;
        }

        //LOGIN API CALL
        var params = JSON.stringify({
            'email': inputValue.email,
            'password': inputValue.password,
        })
        const [success, message, data, error] = await postParamRequest(login, params);
        if (error != null) {
            Alert.alert("Error", error);
        }
        else if (success == false || data == null) {
            Alert.alert("Failed", message);
        }
        else {
            if (data && data !== undefined && data !== null) {
                const user = data.user;
                //dispatch(saveUser(user));
                try {
                    await EncryptedStorage.setItem(
                        "user_session",
                        JSON.stringify({
                            user
                        })
                    );

                    // Congrats! You've just stored your first value!
                } catch (error) {
                    // There was an error on the native side
                }

                navigation.navigate('Home');
            }
        }
        setLoading(false);
    };

    const ShowPasswordImage = () => {
        if (isShowPassword) {
            return <Image
                source={require("../../assets/images/password_hide.png")}
                style={styles.show_password}
            />
        }
        else {
            return <Image
                source={require("../../assets/images/password_show.png")}
                style={styles.show_password}
            />
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <Loader isLoading={isLoading} />
            {/* <ScrollView style={styles.container} bounces={false}> */}
            <View style={styles.main_view}>
                <View style={{ alignItems: 'center' }}>
                    {/* <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" /> */}
                    <Image
                        source={require("../../assets/images/logo-header.png")}
                        style={styles.logo}
                    />
                </View>
                <TextInput
                    style={custome_textfields.primary_textfield}
                    keyboardType="email-address"
                    placeholder="Email"
                    placeholderTextColor='#808080'
                    onChangeText={(text) =>
                        setInputValue({ ...inputValue, email: text })
                    }
                    value={inputValue.email} />
                <View style={[custome_textfields.primary_textfield, { flexDirection: "row" }]}>
                    <TextInput
                        style={{ fontSize: 14, fontWeight: "normal", color: black_color, flex: 1 }}
                        placeholder="Password"
                        placeholderTextColor='#808080'
                        secureTextEntry={!isShowPassword}
                        onChangeText={(text) =>
                            setInputValue({ ...inputValue, password: text })
                        }
                        value={inputValue.password} />
                    <TouchableOpacity style={{ width: 50, height: 50 }} onPress={showPasswordClicked}>
                        <ShowPasswordImage />
                    </TouchableOpacity>
                </View>
                {/* <PrimaryTextInput value={dataFromChild} setInputValue={setDataFromChild}/> */}
                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={custome_buttons.primary_button_view} onPress={logInClicked}>
                        <Text style={custome_buttons.primary_button_title}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[custome_buttons.primary_button_view, {backgroundColor:login_background_color, borderColor: login_background_color}]} onPress={cancelClicked}>
                        <Text style={{color: gray_color, fontSize: 14, fontWeight: '500', textAlign: "center",textDecorationLine: 'underline'}}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* </ScrollView> */}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    main_view: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'center',
        backgroundColor: login_background_color
    },
    logo: {
        width: 300,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 25
    },
    show_password: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginVertical: 13,
        marginLeft: 25,
        marginRight: 5,
        tintColor: primary_color
    },
});

export default LoginScreen;