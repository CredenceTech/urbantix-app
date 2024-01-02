import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  View,
  StyleSheet,
  Text,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import {
  background_color,
  black_color,
  green_color,
  white_color,
  primary_color
} from '../../constants/custome_colors';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { socialLogin } from '../../constants/services';
import EncryptedStorage from 'react-native-encrypted-storage';
import appleAuth from '@invertase/react-native-apple-authentication';
import ProgressDialogView from '../../components/PreogressBar';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import { TextInput } from 'react-native';
import { postParamRequest } from '../../constants/api_manager';
import { login } from '../../constants/api_constants';
const { height, width } = Dimensions.get('screen');
import auth from '@react-native-firebase/auth';
import { custome_screenContainer } from "../../constants/custome_styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const App = () => {

  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [progressBar, setProgressBar] = useState(false);
  const [inputValue, setInputValue] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '949818663835-tjrt4cbskqqfr7racjog0l0r7fom58lg.apps.googleusercontent.com',
    });
  }, []);

  async function signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const { user } = await GoogleSignin.signIn();
      const params = {
        email: user?.email,
        first_name: user?.givenName,
        last_name: user?.familyName,
        image: user?.photo,
        socialMediaId: user?.id,
        socialMediaType: 'Google',
      };

      setProgressBar(true);

      const result = await socialLogin(params);

      if (result?.success) {
        const user = result?.data?.user;
        await EncryptedStorage.setItem('user_session', JSON.stringify({ user }));
        setProgressBar(false);
        navigation.navigate('Home');
      } else {
        setProgressBar(false);
        Alert.alert('Error', result?.message);
      }
    } catch (error) {
      setProgressBar(false);
    }
  }

  async function onAppleButtonPress() {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );
      if (credentialState === appleAuth.State.AUTHORIZED) {
        const params = {
          email: appleAuthRequestResponse?.email,
          first_name: appleAuthRequestResponse?.fullName.givenName || '',
          last_name: appleAuthRequestResponse?.fullName.familyName || '',
          image: '',
          socialMediaId: appleAuthRequestResponse?.user,
          socialMediaType: 'Apple',
        };

        setProgressBar(true);

        const result = await socialLogin(params);

        if (result?.success) {
          const user = result?.data?.user;
          await EncryptedStorage.setItem(
            'user_session',
            JSON.stringify({ user }),
          );
          setProgressBar(false);
          navigation.navigate('Home');
        } else {
          setProgressBar(false);
          Alert.alert('Error', result?.message);
        }
      } else {
        setProgressBar(false);
      }
    } catch (err) {
      setProgressBar(false);
    }
  }

  async function onFacebookButtonPress() {
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken,
    );

    // Sign-in the user with the credential
    auth().signInWithCredential(facebookCredential).then(async (data) => {
      const params = {
        email: data?.user?.email,
        first_name: data?.additionalUserInfo?.profile?.first_name,
        last_name: data?.additionalUserInfo?.profile?.last_name,
        image: data?.user?.photoURL,
        socialMediaId: data?.user?.uid,
        socialMediaType: 'Facebook',
      };
      setProgressBar(true);

      const result = await socialLogin(params);

      if (result?.success) {
        const user = result?.data?.user;
        await EncryptedStorage.setItem(
          'user_session',
          JSON.stringify({ user }),
        );
        setProgressBar(false);
        navigation.navigate('Home');
      } else {
        setProgressBar(false);
        Alert.alert('Error', result?.message);
      }
    }).catch((error) => {
      console.log(error)
    });
  }

  const logInClicked = async () => {
    setProgressBar(true);
    // Check if email or password is empty
    if (!inputValue.email || !inputValue.password) {
      Alert.alert("Validation Error", "Both email and password fields are required");
      setProgressBar(false);
      return;
    }
    // Regular expression to validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(inputValue.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      setProgressBar(false);
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
    setProgressBar(false);
  };

  return (
    <View style={custome_screenContainer.view_container}>
      <View style={{ backgroundColor: black_color, height: safeAreaInsets.top }}>
        <StatusBar backgroundColor='#000000' barStyle="light-content" />
      </View>
      <SafeAreaView>
        {/* <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" /> */}
        <ScrollView bounces={false}>
          <View
            style={{
              flex: 1,
              backgroundColor: background_color,
              height: height,
              paddingHorizontal: width * 0.1,
              // justifyContent: 'space-between'
              // paddingVertical: height * 0.05,
            }}>
            <View
              style={{
                marginTop: 25,
              }}>
              <Text style={{ color: '#FFF', fontSize: 44, fontWeight: 'bold' }}>
                Let's Get You Logged In
              </Text>
              {/* <Text style={{color: '#FFF', marginTop: 10, fontWeight: '500'}}>
              Please log-in to your account with one of the options presented
              below.
            </Text> */}
            </View>
            <View
              style={{
                marginTop: 25,
              }}>
              <Text style={{ fontSize: 15, color: '#FFF', marginVertical: 6 }}>
                Please log in with your
              </Text>
              <TextInput
                style={styles.primary_textfield}
                keyboardType="email-address"
                placeholder="E-mail Address"
                placeholderTextColor="#808080"
                onChangeText={text => setInputValue({ ...inputValue, email: text })}
                value={inputValue.email}
              />
              <TextInput
                style={[styles.primary_textfield, { marginTop: 15 }]}
                placeholder="Password"
                placeholderTextColor="#808080"
                onChangeText={text =>
                  setInputValue({ ...inputValue, password: text })
                }
                value={inputValue.password}
              />
              <View style={{ marginTop: 15 }}>
                <TouchableOpacity
                  style={[styles.buttonItem, { paddingVertical: height * 0.016 }]}
                  onPress={logInClicked}>
                  <Text style={[styles.title]}>Continue</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  width: '97%',
                  marginTop: 20,
                  marginLeft: 5,
                }}>
                <View style={styles.horizontalLine} />
                <Text style={styles.orText}>Or</Text>
                <View style={styles.horizontalLine} />
              </View>
            </View>
            <View
              style={{
                marginTop: 30,
              }}>
              {Platform.OS === 'ios' && (
                <View style={{ marginBottom: 20 }}>
                  <TouchableOpacity
                    style={[styles.buttonItem, { paddingVertical: height * 0.016 }]}
                    onPress={onAppleButtonPress}>
                    <Text style={[styles.title]}>Continue with Apple ID</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={{ marginBottom: 20 }}>
                <TouchableOpacity
                  style={[styles.buttonItem, { paddingVertical: height * 0.016 }]}
                  onPress={signInWithGoogle}>
                  <Text style={[styles.title]}>Continue with Google</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  style={[styles.buttonItem, { paddingVertical: height * 0.016 }]}
                  onPress={onFacebookButtonPress}>
                  <Text style={[styles.title]}>Continue with Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        {progressBar && <ProgressDialogView visible={progressBar} />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  view_container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: background_color,
    height: 200
  },
  buttonItem: {
    backgroundColor: green_color,
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFF',
  },
  primary_textfield: {
    fontSize: 14,
    fontWeight: 'normal',
    color: black_color,
    backgroundColor: white_color,
    borderColor: green_color,
    borderWidth: 2,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 20,
  },
  horizontalLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'white',
  },
  orText: {
    color: '#000',
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 1,
    borderRadius: 12,
    minWidth: 50,
    overflow: 'hidden',
    justifyContent: "center",
    alignItems: "center"
  },
});

export default App;
