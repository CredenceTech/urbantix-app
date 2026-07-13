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
        minimum_price?: number | null;
        maximum_price?: number | null;
        isStudentPassEnable?: number;
    };
    actionOnRow: () => void;
}

const EventComponent: React.FC<EventComponentProps> = ({ objEvent, actionOnRow }) => {
    const progress = objEvent.total_tickets > 0
        ? (objEvent.total_sold / objEvent.total_tickets)
        : 1;
    const prices = [objEvent.minimum_price, objEvent.maximum_price]
        .filter((price): price is number => price != null);
    const uniquePrices = [...new Set(prices)];
    const priceRange = uniquePrices.length > 1
        ? `$${uniquePrices[0]} - $${uniquePrices[1]}`
        : uniquePrices.length === 1
            ? `$${uniquePrices[0]}`
            : 'N/A';
    const priceLabel = uniquePrices.length > 1 ? 'PRICE RANGE' : 'PRICE';

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
                <View style={styles.detailsRow}>
                    <View>
                        <Text style={styles.detailLabel}>TICKETS SOLD</Text>
                        <Text style={styles.detailValue}>
                            {objEvent.total_sold} / {objEvent.total_tickets}
                        </Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.detailLabel}>{priceLabel}</Text>
                        <Text style={styles.priceValue}>{priceRange}</Text>
                    </View>
                </View>
                <Progress.Bar
                    progress={progress}
                    color="#3e8b2b"
                    height={2}
                    width={(Dimensions.get('window').width - 56)}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    main_view: {
        marginHorizontal: 12,
        marginTop: 10,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        flexDirection: "column",
        backgroundColor: black_color,
        borderRadius: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 12,
    },
    event_title: {
        paddingVertical: 0,
        fontSize: 18,
        lineHeight: 22,
        fontWeight: "600",
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
        marginTop: 8,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "normal",
        color: '#D1D1D1',
    },
    event_datetime: {
        marginTop: 3,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "normal",
        color: '#AFAFAF',
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 8,
    },
    detailLabel: {
        color: '#8E8E8E',
        fontSize: 10,
        lineHeight: 14,
        fontWeight: '600',
        letterSpacing: 0.6,
    },
    detailValue: {
        color: white_color,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceValue: {
        color: white_color,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '700',
    },
});

export default EventComponent
