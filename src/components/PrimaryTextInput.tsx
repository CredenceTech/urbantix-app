import React, { useState, Component } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
} from "react-native";
import { black_color, white_color, green_color } from "../constants/custome_colors";
import { custome_textfields } from "../constants/custome_styles";

class PrimaryTextInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            placeholderText: this.props.placeholderText,
            value: this.props.value,
            setInputValue: this.props.setInputValue,
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            placeholderText: nextProps.placeholderText,
            value: nextProps.value,
            setInputValue: nextProps.setInputValue,
        };
    }

    render() {

        return (
            <TextInput
            style={styles.primary_textfield}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor='#808080'
            onChangeText={(text) =>
                this.state.setInputValue(text)
            }
            value={this.state.value} />
        )
    }
}

const styles = StyleSheet.create({
    primary_textfield: {
        fontSize: 16,
        fontWeight: "bold",
        color: black_color,
        backgroundColor: white_color,
        borderColor: green_color,
        borderWidth: 2,
        borderRadius: 10,
        height: 50,
        marginHorizontal: 10
    }
});

export default PrimaryTextInput