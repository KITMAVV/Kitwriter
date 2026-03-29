import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    FlatList,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {useCallback, useState} from "react";
import { useFocusEffect } from "@react-navigation/native";

import ListCard from "../components/ListCard";
import PrimaryButton from "../components/PrimaryButton";

import { getChaptersByBookId, createChapter } from "../repositories/chaptersRepository";
import { getBookById } from "../repositories/booksRepository";

import generateUniqueName from "../utils/nameUtils";


export default function ChapterList({ navigation, route }) {
    
    const { bookId } = route.params;
    const [ chapters, setChapters ] = useState([]);
    const [ bookInfo, setBookInfo ] = useState(null);

    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isDragMode, setIsDragMode] = useState(false);

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
    }
    
    async function handleOpenChapter(chapterId) {

        navigation.navigate("Editor", {
            chapterId: chapterId,
        });

    }



    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.Toolbar}>
                <View style={styles.leftTools}>
                    <PrimaryButton btnText={"<--"} btnWidth={"12%"} onPress={null}/>
                    <Text style={styles.title}>{bookInfo?.book_name}</Text>
                </View>

                <PrimaryButton btnText={"⇄"} btnWidth={"12%"} onPress={null}/>
                <PrimaryButton btnText={"..."} variant={"menu-burger"} menuItems={[{ label: 'Сменить порядок Глав', onPress: () => setIsDragMode(prev => !prev) }, { label: 'Экспорт книги .docs', onPress: () => console.log('Бургер docs') }, { label: 'Удалить главу', onPress: () => setIsDeleteMode(prev => !prev) }, { label: 'Задать цель по словам', onPress: () => console.log('Бургер цель') },]} btnWidth={"11%"} onPress={() => console.log("Хембургер")}/>
                
            </View>

            <View style={styles.listContainer}>
                <View style={styles.listFlatListWrap}>
                                    <FlatList
                                        data={chapters}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({item}) => (
                                            <ListCard title={item.title} content={item.preview} showDrag={isDragMode} showDelete={isDeleteMode}
                                            onPress={() => handleOpenChapter(item.id)}></ListCard>
                                        )}
                                        
                                        contentContainerStyle={[styles.listFlatListContent,  chapters.length === 0 && styles.emptyListContent]}
                
                                        ListEmptyComponent={
                                            <View style={styles.listEmptyWrap}>
                                                <Text>
                                                    ㄟ( ▔, ▔ )ㄏ
                                                </Text>
                                            </View>
                                        }
                                    />
                                </View>

            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.button} onPress={handleCreateChapter}>
                    <Text style={styles.buttonText}>New Chapter</Text>
                </TouchableOpacity>
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
        backgroundColor: "#e8e8e8",
        borderRadius: 15,
        
        overflow: "hidden",
        marginBottom: 15,

    },
    listFlatListContent: {
        gap: 14,
    },

    emptyListContent: {
        flexGrow: 1,
        justifyContent: "center",
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