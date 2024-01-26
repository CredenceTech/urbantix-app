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

const PrimaryTextInput = ({ value, onChangeText, placeholder }) => {
    return (
        <TextInput
            style={styles.primary_textfield}
            keyboardType="email-address"
            placeholder={placeholder}
            placeholderTextColor='#808080'
            value={value}
            onChangeText={onChangeText} />
      );
};

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

export default PrimaryTextInput;