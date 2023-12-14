import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  View,
  StyleSheet,
  Text,
  Alert,
  Platform,
} from 'react-native';
import {background_color, green_color} from '../../constants/custome_colors';
import {Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {socialLogin} from '../../constants/services';
import EncryptedStorage from 'react-native-encrypted-storage';
import appleAuth from '@invertase/react-native-apple-authentication';
import ProgressDialogView from '../../components/PreogressBar';
const {height, width} = Dimensions.get('screen');

const App = () => {
  const [progressBar, setProgressBar] = useState(false);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '949818663835-mbv4q5hoa8jh149hs9bj6ke2ppfqb32k.apps.googleusercontent.com',
    });
  }, []);

  async function signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const {user} = await GoogleSignin.signIn();
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
        await EncryptedStorage.setItem('user_session', JSON.stringify({user}));
        setProgressBar(false);
        navigation.navigate('Home');
      } else {
        setProgressBar(false);
        Alert.alert('Error', result?.message);
      }
    } catch (error) {
      setProgressBar(false);
      console.log(error, 'Error');
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
            JSON.stringify({user}),
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
      console.log(err, 'Error');
        setProgressBar(false);
    }
  }

  const navigation = useNavigation();

  return (
    <SafeAreaView>
      {/* <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" /> */}
      <ScrollView>
        <View
          style={{
            flex: 1,
            backgroundColor: background_color,
            height: height * 1,
            paddingHorizontal: width * 0.1,
            paddingTop: height * 0.05,
            // justifyContent: 'space-between'
            // paddingVertical: height * 0.05,
          }}>
          <View style={{marginBottom: height * 0.25}}>
            <Text style={{color: '#FFF', fontSize: 44, fontWeight: 'bold'}}>
              Let's Get You Logged In
            </Text>
            <Text style={{color: '#FFF', marginTop: 10, fontWeight: '500'}}>
              Please log-in to your account with one of the options presented
              below.
            </Text>
          </View>
          <View>
            <View style={{marginBottom: 20}}>
              <TouchableOpacity
                style={[styles.buttonItem, {paddingVertical: height * 0.016}]}
                onPress={() => {
                  navigation.navigate('LoginScreen');
                }}>
                <Text style={[styles.title]}>Log-in with e-mail address</Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' && (
              <View style={{marginBottom: 20}}>
                <TouchableOpacity
                  style={[styles.buttonItem, {paddingVertical: height * 0.016}]}
                  onPress={onAppleButtonPress}>
                  <Text style={[styles.title]}>Continue with Apple ID</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{marginBottom: 20}}>
              <TouchableOpacity
                style={[styles.buttonItem, {paddingVertical: height * 0.016}]}
                onPress={signInWithGoogle}>
                <Text style={[styles.title]}>Continue with Google</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginBottom: 20}}>
              <TouchableOpacity
                style={[styles.buttonItem, {paddingVertical: height * 0.016}]}
                onPress={() => {}}>
                <Text style={[styles.title]}>Continue with Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      {progressBar && <ProgressDialogView visible={progressBar} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
});

export default App;
