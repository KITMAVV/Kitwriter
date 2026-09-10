import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Checkbox({
    isSelected = false,
    onPress,
}) {
    return (
        <View
            onPress={onPress}
            style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected,
            ]}
        >
            {isSelected && (
                <Text style={styles.checkmark}>✓</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: "#8a8a8a",
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },

    checkboxSelected: {
        backgroundColor: "#222",
        borderColor: "#222",
    },

    checkmark: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
});