import React from 'react';
import {
    primary_color,
    secondary_color,
    background_color,
    white_color,
    black_color,
    green_color
} from './custome_colors'
import {
    StyleSheet,
} from 'react-native';

const custome_screenContainer = StyleSheet.create({
    view_container: {
        flex: 1, 
        flexDirection: "column", 
        backgroundColor: background_color,
        height: 200
    },
    setPrimaryTextField: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 10,
        color: background_color,
    },
});

const custome_textfields = StyleSheet.create({
    primary_textfield: {
        fontSize: 14,
        fontWeight: "normal",
        color: black_color,
        backgroundColor: white_color,
        borderColor: green_color,
        borderWidth: 2,
        borderRadius: 10,
        height: 50,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingHorizontal: 10
    }
});

const custome_buttons = StyleSheet.create({
    primary_button_view: {
        marginVertical: 10,
        marginHorizontal: "auto",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderColor: primary_color,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: primary_color
    },
    primary_button_title: {
        color: white_color,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: "center",
    },
    setSecondaryButton: {
        height: 40,
        margin: 12,
        padding: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export { 
    custome_screenContainer,
    custome_textfields,
    custome_buttons,
}