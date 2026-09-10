import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
} from "react-native";

import {SafeAreaView} from "react-native-safe-area-context";
import React, {useCallback, useState} from "react";
import { useFocusEffect } from "@react-navigation/native";
import DraggableFlatList from "react-native-draggable-flatlist";



import ListCard from "../components/ListCard";
import PrimaryButton from "../components/PrimaryButton";

import { getChaptersByBookId, createChapter, updateChapter } from "../repositories/chaptersRepository";
import { getBookById } from "../repositories/booksRepository";
import { reorderChapters } from "../repositories/chaptersRepository";
import { softDeleteChapter } from "../repositories/chaptersRepository";

import generateUniqueName from "../utils/nameUtils";


export default function ChapterList({ navigation, route }) {
    
    const { bookId } = route.params;
    const [ chapters, setChapters ] = useState([]);
    const [ bookInfo, setBookInfo ] = useState(null);

    const [cardMode, setCardMode] = useState("default");
    const [isReversed, setIsReversed] = useState(false);
    

    async function loadChapters(){
        const data = await getChaptersByBookId(bookId);
        setChapters(data);
    }

    async function loadBookInfo(){
        const data = await getBookById(bookId);
        setBookInfo(data);
    }

    useFocusEffect(
        useCallback(() => {
           
            loadChapters();
            loadBookInfo();

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
        await loadChapters();
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
                    <Text style={styles.title}>{bookInfo?.book_name}</Text>
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
        backgroundColor: "#bcbcbc",
    },
    actionsContainer: {
        flexDirection: "row",
        backgroundColor: "#bcbcbc",
        height: 85,
        gap: 10,
        padding: 15,
        alignItems: "center",
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        justifyContent: "center",
    },
    Toolbar: {
       height: 55,
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
    title: {                        // Нужно предусмотреть на случай если title слишком длинный
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 3,
    },
    listContainer: {
        backgroundColor: "#d5d5d5",
        
        padding: 20,
        gap: 10,
        flex: 1,
        borderRadius: 15,
        

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
        backgroundColor: "#e8e8e8",
        borderRadius: 15,
        
        
        

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