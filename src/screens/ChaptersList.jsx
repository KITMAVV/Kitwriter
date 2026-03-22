import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    FlatList,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {useEffect, useState} from "react";

import ListCard from "../components/ListCard";



const chapters = [
    {
        id: "1",
        chapter_name: "Глава 1",
        chapter_content: "Дуже цікава цікава ікаік цікава",
    },
    {
        id: "2",
        chapter_name: "Глава 2",
        chapter_content: "Не дуже цікава",
    },
    {
        id: "3",
        chapter_name: "Глава 3",
        chapter_content: "Не цікава",
    },
    {
        id: "4",
        chapter_name: "Глава 3",
        chapter_content: "Не цікава",
    },
    {
        id: "5",
        chapter_name: "Глава 1",
        chapter_content: "Дуже цікава цікава ікаік цікава",
    },
    {
        id: "6",
        chapter_name: "Глава 2",
        chapter_content: "Не дуже цікава",
    },
    {
        id: "7",
        chapter_name: "Глава 3",
        chapter_content: "Не цікава",
    },
    {
        id: "8",
        chapter_name: "Глава 3",
        chapter_content: "Не цікава",
    },
];


export default function ChapterList({navigation}) {
    
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.listContainer}>
                <View style={styles.listFlatListWrap}>
                                    <FlatList
                                        data={chapters}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({item}) => (
                                            <ListCard title={item.chapter_name} content={item.chapter_content}></ListCard>
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
                <TouchableOpacity style={styles.button} onPress={ () => console.log("New Chaptr")}>
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
        height: "auto",
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



// Дальше настраивай елементы списка(List Card), и допили все елементы ChapterList(кнопки сверху). Подключать в конец! 
// Кстати, тому кто это читает - приветики:)