import React from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

const ProgressDialogView = ({ visible = false }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}>
            <View style={styles.centeredView}>
                <View style={styles.centerRoundedBox}>
                    <ActivityIndicator
                        color={"blue"}
                        size={"large"} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: "center",
        alignItems: "center",
    },
    centerRoundedBox: {
        height: 80,
        width: 80,
        borderRadius: 12,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ProgressDialogView;