import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity
} from 'react-native';
import { primary_color, white_color } from '../constants/custome_colors';

class NavigationBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowBack: this.props.isShowBack,
            backClicked: this.props.backClicked,
            isShowTitle: this.props.isShowTitle,
            screenTitle: this.props.screenTitle,
            isShowLogout: this.props.isShowLogout,
            logOutClicked: this.props.logOutClicked
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            isShowBack: nextProps.isShowBack,
            backClicked: nextProps.backClicked,
            isShowTitle: nextProps.isShowTitle,
            screenTitle: nextProps.screenTitle,
            isShowLogout: nextProps.isShowLogout,
            logOutClicked: nextProps.logOutClicked
        };
    }

    render() {
        //BackButton
        let BackButton;
        if (this.state.isShowBack) {
            BackButton =
                <TouchableOpacity style={styles.back_button_view} onPress={this.state.backClicked}>
                    <Image
                        source={require("../assets/images/back.png")}
                        style={styles.back_button_image}
                    />
                </TouchableOpacity>;
        }

        //BackButton
        let ScreenTitle;
        if (this.state.isShowTitle) {
            ScreenTitle = <Text style={styles.navigationTitle}>{this.state.screenTitle}</Text>;
        }

        //LogoutButton
        let LogoutButton;
        if (this.state.isShowLogout) {
            LogoutButton =
                <TouchableOpacity style={styles.logout_button_view} onPress={this.state.logOutClicked}>
                    <Text style={styles.logout_button_title}>Logout</Text>
                </TouchableOpacity>;
        }

        return (
            <View style={styles.navigationBackground}>
                {BackButton}
                {ScreenTitle}
                {LogoutButton}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    navigationBackground: {
        alignItems: 'center',
        flexDirection: 'row',
        //   justifyContent: 'space-around',
        paddingHorizontal: 10,
        backgroundColor: primary_color,
        zIndex: 1000,
        height: 50,
    },
    back_button_view: {
        paddingBottom: 0,
        paddingRight: 0,
        marginRight: 10,
        width: 40,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    back_button_image: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: white_color
    },
    navigationTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: white_color
    },
    logout_button_view: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderColor: white_color,
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: white_color
    },
    logout_button_title: {
        color: primary_color,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: "center",
    },
});

export default NavigationBar
