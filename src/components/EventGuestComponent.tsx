import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";
import { black_color, white_color, gray_color } from "../constants/custome_colors";

interface EventGuestComponentProps {
    objEventGuest: {
        first_name: string;
        last_name: string;
        email: string;
        cell_phone: string;
    };
    actionOnRow?: () => void;
}

const EventGuestComponent: React.FC<EventGuestComponentProps> = ({ objEventGuest, actionOnRow }) => {
    return (
        <TouchableWithoutFeedback onPress={actionOnRow}>
            <View style={styles.main_view}>
                <Text style={styles.event_title}>
                    {objEventGuest.first_name} {objEventGuest.last_name}
                </Text>
                <Text style={styles.event_address}>{objEventGuest.email}</Text>
                <Text style={styles.event_address}>{objEventGuest.cell_phone}</Text>
                <View style={{ height: 1, backgroundColor: gray_color, marginHorizontal: 5 }} />
            </View>
        </TouchableWithoutFeedback>
    );
};

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