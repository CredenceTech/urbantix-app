import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";
import { black_color, white_color } from "../constants/custome_colors";
import * as Progress from 'react-native-progress';
import moment from 'moment';

interface EventComponentProps {
    objEvent: {
        name: string;
        place: string;
        start_date: string;
        total_sold: number;
        total_tickets: number;
        minimum_price: number;
        isStudentPassEnable?: number;
    };
    actionOnRow: () => void;
}

const EventComponent: React.FC<EventComponentProps> = ({ objEvent, actionOnRow }) => {
    const progress = objEvent.total_tickets > 0
        ? (objEvent.total_sold / objEvent.total_tickets)
        : 1;

    return (
        <TouchableWithoutFeedback onPress={actionOnRow}>
            <View style={styles.main_view}>
                <View style={styles.headerRow}>
                    <Text style={styles.event_title}>{objEvent.name}</Text>
                    {objEvent.isStudentPassEnable === 1 && (
                        <View style={styles.studentPassBadge}>
                            <Text style={styles.studentPassBadgeText}>Student Pass</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.event_address}>{objEvent.place}</Text>
                <Text style={styles.event_datetime}>
                    {moment(objEvent.start_date).format('dddd MMMM D, YYYY hh:mm a')}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 10, marginBottom: 5 }}>
                    <Text style={styles.event_datetime}>{objEvent.total_sold}/{objEvent.total_tickets}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.event_datetime}>${objEvent.minimum_price}</Text>
                </View>
                <Progress.Bar
                    progress={progress}
                    color="#3e8b2b"
                    height={2}
                    width={(Dimensions.get('window').width - 30)}
                />
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 12,
    },
    event_title: {
        paddingVertical: 0,
        fontSize: 24,
        lineHeight: 28,
        fontWeight: "bold",
        color: white_color,
        flex: 1,
    },
    studentPassBadge: {
        backgroundColor: '#3E8B2B',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'center',
    },
    studentPassBadgeText: {
        color: white_color,
        fontSize: 10,
        fontWeight: 'bold',
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

export default EventComponent
