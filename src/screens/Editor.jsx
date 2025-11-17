import React from "react";
import {View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";

export default function Editor() {
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView  style={styles.keyboardWrapper} behavior={Platform.OS === "ios" ? "padding" : "height"} >

                    <View style={styles.content}>
                        <TextInput placeholder="Начните творить здесь..." multiline textAlignVertical="top" style={styles.input}></TextInput>

                        <View style={styles.actionsContainer}>
                            <PrimaryButton btnText={"↶"} onPress={() => console.log("Fuc")}/>
                            <PrimaryButton btnText={"↷"} onPress={() => console.log("Fuc")}/>
                            <PrimaryButton btnText={"Type ▼"} variant={"menu"} menuItems={[{ label: 'H1', onPress: () => console.log('H1') }, { label: 'H2', onPress: () => console.log('H2') }, { label: 'Абзац', onPress: () => console.log('abzts') },]} onPress={() => console.log("Fuc")}/>
                            <PrimaryButton btnText={"B"} onPress={() => console.log("Fuc")}/>
                            <PrimaryButton btnText={"I"} onPress={() => console.log("Fuc")}/>

                            <PrimaryButton btnText={"—“Quote“"} onPress={() => console.log("Fuc")}/>

                        </View>
                    </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    keyboardWrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#f4f4f4",
    },
    content: {
        flex: 1,
    },
    actionsContainer: {
        flexDirection: "row",
        backgroundColor: "#e6e6e6",
        height: 60,
        borderTopColor: "#c5c5c5",
        borderTopWidth: 1,
        justifyContent: "center",

        padding: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },
    input: {
        flex: 1,
        margin: 12,
        letterSpacing: 1,
        fontSize: 12,
        borderColor: "#a6a6a6",
        borderWidth: 1,
        padding: 10,
        backgroundColor: "#ffffff",
    },
});
