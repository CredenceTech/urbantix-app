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
import { black_color, white_color, green_color, primary_color } from "../constants/custome_colors";
import * as Progress from 'react-native-progress';
import moment from 'moment';

class EventComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            objEvent: this.props.objEvent,
            actionOnRow: this.props.actionOnRow
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            objEvent: nextProps.objEvent,
            actionOnRow: nextProps.actionOnRow
        };
    }

    render() {



        return (
            <TouchableWithoutFeedback onPress={this.state.actionOnRow}>
                <View style={styles.main_view}>
                    <Text style={styles.event_title}>{this.state.objEvent.name}</Text>
                    <Text style={styles.event_address}>{this.state.objEvent.place}</Text>
                    <Text style={styles.event_datetime}>{moment(moment(this.state.objEvent.start_date, 'YYYY-MM-DD HH:mm:ss.ZZZ')).format('dddd MMMM D, YYYY at hh:mm a')}</Text>
                    <View style={{ flexDirection: "row", marginTop: 10, marginBottom: 5 }}>
                        <Text style={styles.event_datetime}>{this.state.objEvent.total_sold}/{this.state.objEvent.total_tickets}</Text>
                        <View style={{ flex: 1 }} />
                        <Text style={styles.event_datetime}>${this.state.objEvent.minimum_price}</Text>
                    </View>
                    <Progress.Bar progress={1} color="#3e8b2b" height={2} width={(Dimensions.get('window').width - 30)} />
                    {/* <Progress.Bar progress={((this.state.objEvent.total_sold / this.state.objEvent.total_tickets) * 100) / 100} color="#3e8b2b" height={2} width={(Dimensions.get('window').width - 30)} /> */}
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

export default EventComponent