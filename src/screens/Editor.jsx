import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";

import { getChapterById, updateChapter } from "../repositories/chaptersRepository";
import { getBookById } from "../repositories/booksRepository";

import countWords from "../utils/countWords";
import useChapterAutosave from "../hooks/useChapterAutosave";

export default function Editor({ route, navigation }) {

    const { chapterId } = route.params;
    const [ chapter, setChapter ] = useState(null);
    const [ text, setText ] = useState("");
    const [ book, setBook ] = useState(null);
    
    const [hasUserEdited, setHasUserEdited] = useState(false);

    useChapterAutosave(chapterId, text, hasUserEdited);

    useEffect(() =>{

        async function loadBook(bookId) {
            const data = await getBookById(bookId);
            setBook(data);
            console.log('Book Name: ', data?.book_name);
        }
        
        async function loadChapter() {
            const data = await getChapterById(chapterId);
            setChapter(data);
            setText(data.content_md)
            setHasUserEdited(false);
            console.log('Chapter ID: ', data.id);

            if (data?.book_id) {
                await loadBook(data.book_id);
            }
        }

        loadChapter();

    }, [chapterId]);


    function handleTextChange(value) {
        setText(value);
        setHasUserEdited(true);
    }


    // РУЧНОЙ СЕЙВ КНОПКИ. Стоит также добавить сейв при уходе жестом/кнопочкой назад
    async function saveText() {
        await updateChapter(chapterId, { content_md: text });
        navigation.goBack();
    }


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView  style={styles.keyboardWrapper} behavior={Platform.OS === "ios" ? "padding" : "height"} >

                    <View style={styles.content}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerLeft}>
                                <PrimaryButton
                                    btnText={"<--"}
                                    btnWidth={45}
                                    onPress={saveText}
                                />

                                <View style={styles.headerText}>
                                    <Text style={styles.title} numberOfLines={1}>
                                        {book?.book_name}
                                    </Text>

                                    <Text style={styles.subtitle} numberOfLines={1}>
                                        {chapter?.title}
                                    </Text>

                                    <Text style={styles.infoTitle} numberOfLines={1}>
                                        {countWords(text)} слов | Ожидаемо: 200 слов
                                    </Text>
                                </View>
                            </View>

                            <PrimaryButton btnText={"..."} variant={"menu-burger"} menuItems={[{ label: 'Добавить комментарий', onPress: () => console.log('Бургер коментарий') }, { label: 'Моно', onPress: () => console.log('Бургер моно') }, { label: 'Темный', onPress: () => console.log('Бургер темный') }, { label: 'Читать', onPress: () => console.log('Бургер читать') },]} btnWidth={"11%"} onPress={() => console.log("Menu")}/>
                        </View>





                        <TextInput placeholder="Начните творить здесь..." multiline textAlignVertical="top" style={styles.input} value={text} onChangeText={handleTextChange}></TextInput>

                        <View style={styles.actionsContainer}>
                            <PrimaryButton btnText={"↶"} onPress={() => console.log("Undo")}/>
                            <PrimaryButton btnText={"↷"} onPress={() => console.log("Redo")}/>
                            <PrimaryButton btnText={"B"} onPress={() => console.log("Bold")}/>
                            <PrimaryButton btnText={"I"} onPress={() => console.log("Italy")}/>

                            <PrimaryButton btnText={"—“Quote“"} onPress={() => console.log("Quote")}/>

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
        height: 55,
        borderTopColor: "#c5c5c5",
        borderTopWidth: 1,
        justifyContent: "center",

        padding: 5,
    },
    input: {
        flex: 1,
        margin: 4,
        letterSpacing: 0.3,
        fontSize: 12,
        borderColor: "#ededed",
        borderWidth: 1,
        paddingHorizontal: 28,
        paddingTop: 20, // костиль, решиться при  ScrollView
        paddingBottom: 0,
        backgroundColor: "#ffffff",
    },


    headerContent: {
        height: 90,
        padding: 4,
        flexDirection: "row",
        // backgroundColor: "#ff0",
    },
    headerLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    headerText: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
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
