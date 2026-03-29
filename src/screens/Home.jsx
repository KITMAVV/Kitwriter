import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {useEffect, useState} from "react";

import BookCard from "../components/Cards";
import { getAllBooks, createBook, getLastActiveBook } from "../repositories/booksRepository";
import { createChapter } from "../repositories/chaptersRepository";

import generateUniqueName from "../utils/nameUtils";

export default function Home({navigation}) {
    
    const [books, setBooks] = useState([]);
    const [lastActiveBook, setLastActiveBook] = useState(null);


    async function loadBooks() {
        const data = await getAllBooks();
        setBooks(data);
        // try {
        //     const data = await getAllBooks();
        //     setBooks(data);
        // } catch (error) {
        //     console.error("Books load error ----->", error);
        // }
        // init race. При первом запуске база не успевает создаться(а юзефект вполне). Легко фиксануть, просто передавая true из App. Но ща можно тупо забить, ведь ошибка только на первом старте проги ...(*￣０￣)ノ
    };


    async function loadLastActiveBook() {
        const data = await getLastActiveBook();
        setLastActiveBook(data);
    }

    useEffect(() =>{
        loadBooks();
        loadLastActiveBook();
    }, []);

    
    

    async function handleCreateBook() {

        const uniqueName = generateUniqueName(books, "book_name", "Документ");
        
        const book = await createBook({
            book_name: uniqueName,
        });

        const chapter = await createChapter({
            book_id: book.id,
            title: "Глава 1",
            content_md: ""
        });

        await loadBooks();
        await loadLastActiveBook();

        navigation.navigate("Editor", {
            chapterId: chapter.id,
        });
    }

    
    async function handleOpenBook(bookId) {
        console.log(bookId);
        navigation.navigate("ChapterList", {
            bookId: bookId,
        });
    }


    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.cardsContainer}>
                <Text style={styles.title}>Все файлы</Text>

                <View style={styles.cardsFlatListWrap}>
                    <FlatList
                        data={books}
                        horizontal
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({item}) => (
                            <BookCard title={item.book_name} description={item.description} imgUri={item.cover_image}
                                      onPress={() => handleOpenBook(item.id)}/>
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[styles.cardsFlatListContent,  books.length === 0 && styles.emptyListContent]}

                        ListEmptyComponent={
                            <View style={styles.cardsEmptyWrap}>
                                <Text>
                                    ㄟ( ▔, ▔ )ㄏ
                                </Text>
                            </View>
                        }
                    />
                </View>

                <Text style={styles.title}>Продолжить работу</Text>
                <View style={styles.bigCardWrap}>
                    {lastActiveBook ? (
                        <BookCard
                            title={lastActiveBook.book_name}
                            description={lastActiveBook.description}
                            imgUri={lastActiveBook.cover_image}
                            variant="big"
                            onPress={() => handleOpenBook(lastActiveBook.id)}
                        />
                    ) : (
                        <View style={styles.bigCardWrap}>
                            <Text>Начните творить сейчас</Text>
                        </View>
                    )}
                </View>
            </View>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleCreateBook}>
                        <Text style={styles.buttonText}>✎</Text>
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

    cardsContainer: {
        backgroundColor: "#d5d5d5",
        padding: 20,
        gap: 10,
        flex: 1,
        borderRadius: 15,

    },
    cardsFlatListWrap: {
        backgroundColor: "#e8e8e8",
        borderRadius: 15,
        height: 245,
        overflow: "hidden",
        marginBottom: 15,

    },
    cardsFlatListContent: {
        gap: 14,
    },

    emptyListContent: {
        flexGrow: 1,
        justifyContent: "center",
    },

    cardsEmptyWrap: {
        flex: 1,
        margin: 10,
        borderRadius: 15,
        backgroundColor: "#d5d5d5",
        alignItems: "center",
        justifyContent: "center",
    },

    bigCardWrap: {
        backgroundColor: "#e8e8e8",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        height: 285,
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

    // input: {
    //
    //     borderRadius: 30,
    //     borderColor: "#878787",
    //     height: 45,
    //     width: 280,
    //     borderWidth: 1,
    //     padding: 10,
    //     backgroundColor: "#e6e6e6",
    // },

    title: {
        fontSize: 22,
        fontWeight: "bold",
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
});