import React, { Component } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";
import { black_color, white_color, green_color, primary_color, gray_color } from "../constants/custome_colors";
import moment from 'moment';

class EventGuestComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            objEventGuest: this.props.objEventGuest,
            actionOnRow: this.props.actionOnRow
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            objEventGuest: nextProps.objEventGuest,
            actionOnRow: nextProps.actionOnRow
        };
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={this.state.actionOnRow}>
                <View style={styles.main_view}>
                    <Text style={styles.event_title}>{this.state.objEventGuest.first_name + ' ' + this.state.objEventGuest.last_name}</Text>
                    <Text style={styles.event_address}>{this.state.objEventGuest.email}</Text>
                    <Text style={styles.event_address}>{this.state.objEventGuest.cell_phone}</Text>
                    <View style={{height: 1, backgroundColor:gray_color, marginHorizontal: 5}}></View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

const styles = StyleSheet.create({
    main_view: {
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 10,
        flexDirection: "column",
        backgroundColor: black_color,
    },
    event_title: {
        paddingVertical: 2,
        fontSize: 24,
        fontWeight: "bold",
        color: white_color,
    },
    event_address: {
        paddingVertical: 2,
        fontSize: 14,
        fontWeight: "normal",
        color: white_color,
    },
    event_datetime: {
        fontSize: 14,
        fontWeight: "normal",
        color: white_color,
    },
});

export default EventGuestComponent