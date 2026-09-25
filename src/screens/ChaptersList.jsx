import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text, Pressable,
} from "react-native";

import {SafeAreaView} from "react-native-safe-area-context";
import React, {useCallback, useRef, useState} from "react";
import { useFocusEffect } from "@react-navigation/native";
import DraggableFlatList from "react-native-draggable-flatlist";



import ListCard from "../components/cards/ListCard";
import PrimaryButton from "../components/ui/PrimaryButton";

import {
    getChaptersByBookId,
    createChapter,
    updateChapter,
    reorderChapters,
    softDeleteChapter,
} from "../repositories/chaptersRepository";
import {getBookById, getBookWordStats, updateBook} from "../repositories/booksRepository";


import generateUniqueName from "../utils/nameUtils";
import PopoverWordCount from "../components/popovers/PopoverWordCount";


export default function ChapterList({ navigation, route }) {

    const { bookId } = route.params;
    const [ chapters, setChapters ] = useState([]);
    const [ bookInfo, setBookInfo ] = useState(null);
    const [ bookStats, setBookStats ] = useState(null);

    const [cardMode, setCardMode] = useState("default");
    const [isReversed, setIsReversed] = useState(false);

    const [visible, setVisible] = useState(false);
    const wordCounterRef = useRef(null);



    async function loadChapters(){
        const data = await getChaptersByBookId(bookId);
        setChapters(data);
    }

    async function loadBookInfo(){
        const data = await getBookById(bookId);
        setBookInfo(data);
    }

    async function loadBookStats(){
        const data = await getBookWordStats(bookId);
        setBookStats(data);
    }

    useFocusEffect(
        useCallback(() => {

            loadChapters();
            loadBookInfo();
            loadBookStats();

        }, [bookId])
    );


    async function handleCreateChapter() {
        const uniqueName = generateUniqueName(chapters, "title", "Глава", true);

        const chapter = await createChapter({
            book_id: bookId,
            title: uniqueName,
            content_md: ""
        });



        navigation.navigate("Editor", {
            chapterId: chapter.id,
        });
        console.log(chapter);
    }

    async function handleOpenChapter(chapterId) {

        navigation.navigate("Editor", {
            chapterId: chapterId,
        });

    }

    function handleOpenTrash() {

        navigation.navigate("Trash", {
            bookId: bookId,
        });
    }

   async function handleRenameChapter(chapterId, newTitle) {
        const trimmed = newTitle.trim();

        if (!trimmed) return;

        await updateChapter(chapterId, {
            title: trimmed,
        });

        await loadChapters();
    }

    async function handleDeleteChapter(chapterId) {
        await softDeleteChapter(chapterId);

        await Promise.all([
            loadChapters(),
            loadBookStats(),
        ]);
    }

    async function handleChangeBookTarget(value, chapterCount) {
        const targetWordCount =
            value.trim() === "" ? null : Number(value);

        const targetChapterCount =
            chapterCount.trim() === "" ? null : Number(chapterCount);

        await updateBook(bookId, {
            target_word_count: targetWordCount,
            target_chapter_count: targetChapterCount,
        });

        await loadBookStats();
    }


    function handleBack() {
        navigation.goBack();
    }


    function toggleReverse() {
        setIsReversed(prev => !prev);
    }


    async function handleReorder(data) {
        const chapterIds = data.map(chapter => chapter.id)
        await reorderChapters(bookId, chapterIds)
    }

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.Toolbar}>
                <View style={styles.leftTools}>
                    <PrimaryButton btnText={"<--"} btnWidth={45} onPress={handleBack}/>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{bookInfo?.book_name}</Text>
                        <Pressable ref={wordCounterRef} onPress={() => setVisible(true)}>
                            <Text style={styles.infoTitle} numberOfLines={1}>
                                {bookStats?.word_count ?? 0} слов | {bookStats?.target_word_count != null ? `Цель: ${bookStats.target_word_count}` : "Цель не задана"}
                            </Text>
                        </Pressable>

                        <PopoverWordCount variant="book" visible={visible} anchorRef={wordCounterRef} defaultText={bookStats?.target_word_count} defaultChapterCount={bookStats?.target_chapter_count} onSave={handleChangeBookTarget} onClose={() => setVisible(false)}/>

                    </View>
                </View>

                <PrimaryButton btnText={"⇄"} btnWidth={"12%"} onPress={null}/>
                <PrimaryButton btnText={"..."} variant={"menu-burger"} menuItems={[{ label: 'Сменить порядок Глав', onPress: () => setCardMode(prev => prev === "drag" ? "default" : "drag") }, { label: 'Экспорт книги .docs', onPress: () => console.log('Бургер docs') }, { label: 'Удалить главу', onPress: () => setCardMode(prev => prev === "delete" ? "default" : "delete" ) }, { label: 'Задать цель по словам', onPress: () => console.log('Бургер цель') }, { label: 'Корзина', onPress: handleOpenTrash },]} btnWidth={"11%"} onPress={() => console.log("Хембургер")}/>

            </View>


            <View style={[ styles.listContainer, isReversed && { justifyContent: "flex-end" } ]}>
                <View style={styles.listFlatListWrap}>
                    {chapters.length === 0 ? (
                        <View style={styles.listEmptyWrap}>
                            <Text>ㄟ( ▔, ▔ )ㄏ</Text>
                        </View>
                    ) : (
                        <DraggableFlatList
                            style={styles.dragList}
                            data={chapters}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, drag, isActive }) => (
                                <ListCard
                                    title={item.title}
                                    content={item.preview}
                                    mode={cardMode}
                                    onDrag={drag}
                                    onDeletePress={() => handleDeleteChapter(item.id)}
                                    onPress={() => handleOpenChapter(item.id)}
                                    onEditPress={(newTitle) =>
                                        handleRenameChapter(item.id, newTitle)
                                    }
                                />
                            )}
                            onDragEnd={async ({ data }) => {
                                setChapters(data);
                                await handleReorder(data);
                            }}
                        />
                    )}
                </View>

            </View>


            <View style={styles.actionsContainer}>


                <TouchableOpacity style={styles.button} onPress={handleCreateChapter}>
                    <Text style={styles.buttonText}>New Chapter</Text>
                </TouchableOpacity>

                {/*  Кнопка для одной руки, инвертирует список глав и тащит весь список вниз*/}
                <PrimaryButton btnText={"⇅"} btnWidth={"15%"} onPress={toggleReverse}/>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#efefef",
    },
    actionsContainer: {
        flexDirection: "row",
        backgroundColor: "#efefef",
        height: 85,
        gap: 10,
        padding: 15,
        alignItems: "center",
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: "#c5c5c5",
        justifyContent: "center",
    },
    Toolbar: {
        height: 65,
        padding: 5,
        flexDirection: "row",
        justifyContent: "space-between",

    },
    leftTools:{
        flex: 1,
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    headerText:{
        // backgroundColor: "#ff0000",
        flex: 1,
    },
    title: {                        // Нужно предусмотреть на случай если title слишком длинный
        fontSize: 22,
        fontWeight: "400",
        marginBottom: 3,
    },
    infoTitle: {
        fontSize: 12,
        color: "#888888",
    },
    listContainer: {
        // backgroundColor: "#efefef",
        paddingHorizontal: 10,
        paddingVertical: 3,
        flex: 1,


    },
    button: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        backgroundColor: "#e4e4e4",
        borderColor: "#878787",
        borderWidth: 1,
        borderRadius: 30,
    },

    buttonText: {
        color: "#000000",
        fontSize: 16,
    },



    listFlatListWrap: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 15,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderColor: "#e1e1e1",



    },
    dragList: {

        borderRadius: 15,
    },

    listEmptyWrap: {
        flex: 1,
        margin: 10,
        borderRadius: 15,
        backgroundColor: "#d5d5d5",
        alignItems: "center",
        justifyContent: "center",
    },
});
