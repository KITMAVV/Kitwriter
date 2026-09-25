import React, { useEffect, useState, useRef } from "react";
import {View, Text, StyleSheet, TextInput, Pressable,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { usePreventRemove } from '@react-navigation/native';


import PrimaryButton from "../components/ui/PrimaryButton";
import EditorActions from "../components/editor/EditorActions";
import PopoverWordCount from "../components/popovers/PopoverWordCount";

import {getChapterById, updateChapterTargetWordCount, getChapterWordTarget,} from "../repositories/chaptersRepository";
import { getBookById } from "../repositories/booksRepository";

import countWords from "../utils/countWords";
import useChapterAutosave from "../hooks/useChapterAutosave";
import {KeyboardAwareScrollView, KeyboardStickyView} from "react-native-keyboard-controller";


export default function Editor({ route, navigation }) {

    const { chapterId } = route.params;
    const [ chapter, setChapter ] = useState(null);
    const [ text, setText ] = useState("");
    const [ book, setBook ] = useState(null);

    const [hasUserEdited, setHasUserEdited] = useState(false);


    const saveNow = useChapterAutosave(chapterId, text, hasUserEdited);

    const [allowLeave, setAllowLeave] = useState(false);
    const isLeavingRef = useRef(false);
    const pendingActionRef = useRef(null);

    const [inputHeight, setInputHeight] = useState(18);

    const wordCounterRef = useRef(null);
    const [targetWordCount, setTargetWordCount] = useState(null);
    const [manualTargetWordCount, setManualTargetWordCount] = useState(null);
    const [visible, setVisible] = useState(false);

    usePreventRemove(!allowLeave, ({ data }) => {
        if (isLeavingRef.current) return;

        isLeavingRef.current = true;

        async function saveAndLeave() {
            try {
                await saveNow();

                pendingActionRef.current = data.action;
                setAllowLeave(true);
            } catch (error) {
                isLeavingRef.current = false;
                console.error('Save err:', error);
            }
        }

        void saveAndLeave();
    });

    useEffect(() => {
        if (!allowLeave || !pendingActionRef.current) return;

        const action = pendingActionRef.current;
        pendingActionRef.current = null;

        navigation.dispatch(action);
    }, [allowLeave, navigation]);

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

            await loadChapterTarget();
            console.log('Chapter ID: ', data.id);

            if (data?.book_id) {
                await loadBook(data.book_id);
            }
        }

        loadChapter();

    }, [chapterId]);

    async function loadChapterTarget() {
        const target = await getChapterWordTarget(chapterId);

        setTargetWordCount(
            target?.effectiveTarget ?? null
        );

        setManualTargetWordCount(
            target?.manualTarget ?? null
        );
    }


    function handleTextChange(value) {
        setText(value);
        setHasUserEdited(true);
    }


    function saveText() {
        navigation.goBack();
    }


    async function handleChangeTarget(value) {
        const newTarget =
            value.trim() === ""
                ? null
                : Number(value);

        await updateChapterTargetWordCount(
            chapterId,
            newTarget
        );

        await loadChapterTarget();
    }


    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.content}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <PrimaryButton
                            btnText={"<--"}
                            btnWidth={45}
                            onPress={saveText}
                        />

                        <View style={styles.headerText}>
                            <Text style={styles.subtitle} numberOfLines={1}>
                                <Text style={styles.title}>{chapter?.title}   |   </Text>{book?.book_name}
                            </Text>
                            <Pressable ref={wordCounterRef} onPress={() => setVisible(true)}>
                                <Text style={styles.infoTitle} numberOfLines={1}>
                                    {countWords(text)} слов | {targetWordCount != null ? `Ожидаемо: ${targetWordCount} слов` : "Цель не задана"}
                                </Text>
                            </Pressable>

                            <PopoverWordCount visible={visible} onClose={() => setVisible(false)} anchorRef={wordCounterRef} onSave={handleChangeTarget} defaultText={manualTargetWordCount}/>
                        </View>
                    </View>

                    <PrimaryButton btnText={"..."} variant={"menu-burger"} menuItems={[{ label: 'Добавить комментарий', onPress: () => console.log('Бургер коментарий') }, { label: 'Моно', onPress: () => console.log('Бургер моно') }, { label: 'Темный', onPress: () => console.log('Бургер темный') }, { label: 'Читать', onPress: () => console.log('Бургер читать') },]} btnWidth={"11%"} onPress={() => console.log("Menu")}/>
                </View>



                <View style={styles.workingArea}>
                    <KeyboardAwareScrollView
                        style={styles.editorScroll}
                        contentContainerStyle={styles.editorScrollContent}
                        bottomOffset={90}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TextInput
                            placeholder="Начните творить здесь..."
                            multiline
                            textAlignVertical="top"
                            scrollEnabled={false}
                            underlineColorAndroid="transparent"
                            style={[
                                styles.input,
                                { height: inputHeight },
                            ]}
                            value={text}
                            onChangeText={handleTextChange}
                            onContentSizeChange={({ nativeEvent }) => {
                                const height = Math.ceil(
                                    nativeEvent.contentSize.height
                                );

                                setInputHeight(Math.max(18, height));
                            }}
                        />
                    </KeyboardAwareScrollView>
                </View>
            </View>

        <KeyboardStickyView
            style={styles.actionsSticky}
            pointerEvents="box-none"
        >
            <EditorActions />
        </KeyboardStickyView>


        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f4f4",
    },
    content: {
        flex: 1,
    },

    headerContent: {
        height: 75,
        padding: 6,
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#e1e1e1",
        // backgroundColor: "#ff0",
    },
    headerLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    headerText: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
    },
    title: {
        fontSize: 19,
        fontWeight: "400",
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: "300",
    },
    infoTitle: {
        fontSize: 12,
        color: "#888888",
        paddingTop: 4,
    },

    workingArea: {
        flex: 1,
        backgroundColor: "#ffffff",
    },

    editorScroll: {
        flex: 1,
    },

    editorScrollContent: {
        flexGrow: 1,
        paddingTop: 14,
        paddingBottom: 150,
    },

    input: {
        flexGrow: 1,
        flexShrink: 0,

        letterSpacing: 0.3,
        lineHeight: 18,
        fontSize: 11,

        paddingHorizontal: 20,
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: "#ffffff",
    },


    actionsSticky: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },





});
