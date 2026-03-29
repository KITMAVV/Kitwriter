import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";

import { getChapterById, updateChapter } from "../repositories/chaptersRepository";
import { getBookById } from "../repositories/booksRepository";

export default function Editor({ route }) {

    const { chapterId } = route.params;
    const [ chapter, setChapter ] = useState(null);
    const [ text, setText ] = useState("");
    const [ book, setBook ] = useState(null);
    

    useEffect(() =>{

        async function loadBook(bookId) {
            const data = await getBookById(bookId);
            setBook(data);
            console.log(data?.book_name);
        }
        
        async function loadChapter() {
            const data = await getChapterById(chapterId);
            setChapter(data);
            setText(data.content_md)
            console.log(data.id);

            if (data?.book_id) {
                await loadBook(data.book_id);
            }
        }

        loadChapter();

    }, [chapterId]);


    async function saveText() {
        await updateChapter(chapterId, { content_md: text });
        console.log("Upd succsfl --- DELETE THIS LINE PLS ");
    }


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView  style={styles.keyboardWrapper} behavior={Platform.OS === "ios" ? "padding" : "height"} >

                    <View style={styles.content}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerLeft}>
                                <PrimaryButton btnText={"<--"} btnWidth={"12%"} onPress={saveText}/>

                                <View>
                                    <Text style={styles.title}>{book?.book_name}</Text>
                                    <Text style={styles.subtitle}>{chapter?.title}</Text>
                                    <Text style={styles.infoTitle}>12 слов | Ожидаемо: 200 слов</Text>
                                </View>
                            </View>

                            <PrimaryButton btnText={"..."} variant={"menu-burger"} menuItems={[{ label: 'Добавить комментарий', onPress: () => console.log('Бургер коментарий') }, { label: 'Моно', onPress: () => console.log('Бургер моно') }, { label: 'Темный', onPress: () => console.log('Бургер темный') }, { label: 'Читать', onPress: () => console.log('Бургер читать') },]} btnWidth={"11%"} onPress={() => console.log("Menu")}/>
                        </View>





                        <TextInput placeholder="Начните творить здесь..." multiline textAlignVertical="top" style={styles.input} value={text} onChangeText={setText}></TextInput>

                        <View style={styles.actionsContainer}>
                            <PrimaryButton btnText={"↶"} onPress={() => console.log("Fuc")}/>
                            <PrimaryButton btnText={"↷"} onPress={() => console.log("Fuc")}/>
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
    input: {
        flex: 1,
        margin: 12,
        letterSpacing: 1,
        fontSize: 12,
        borderColor: "#f8f8f8",
        borderWidth: 1,
        padding: 10,
        backgroundColor: "#ffffff",
    },


    headerContent: {
        gap: 10,
        height: 70,
        padding: 2,
        flexDirection: "row",
    },
    headerLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 19,
        fontWeight: "bold",
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 16,
    },
    infoTitle: {
        fontSize: 13,
        color: "#a5a5a5",
        fontStyle: "italic",
    },



});
