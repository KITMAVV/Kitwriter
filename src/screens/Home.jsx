import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    FlatList,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {useEffect, useState} from "react";

import BookCard from "../components/Cards";
import { getAllBooks, createBook } from "../repositories/booksRepository";



export default function Home({navigation}) {
    
    const [books, setBooks] = useState([]);

    async function loadBooks() {
        const data = await getAllBooks();
            setBooks(data);
            console.log(data);
    }

    useEffect(() =>{
        loadBooks();
    }, []);

    

    async function handleCreateBook() {
        const book = await createBook({
            book_name: "Без Названия"
        });
        await loadBooks();
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
                                      onPress={() => console.log("Opening file", item)}/>
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[styles.cardsFlatListContent,  books.length === 0 && styles.emptyListContent]}

                        ListEmptyComponent={
                            <View style={styles.cardsEmptyWrap}>
                                <Text>
                                    Начните творить сейчас
                                </Text>
                            </View>
                        }
                    />
                </View>

                <Text style={styles.title}>Продолжить работу</Text>
                <View style={styles.bigCardWrap}>
                    <BookCard title="Очень умная книга" description="Some smart book idk fr. I love this stupid book" variant="big"/>
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

        alignItems: "center",
        height: 300,
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
