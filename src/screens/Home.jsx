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

import BookCard from "../components/Cards";


const files = [
    {
        id: "1",
        name: "Цікава книга",
        description: "Дуже цікава",
        uri: null,
    },
    {
        id: "2",
        name: "Цікава книга 2",
        description: "Не дуже цікава",
        uri: null,
    },
    {
        id: "3",
        name: "Цікава книга 3",
        description: "Не цікава",
        uri: null,
    },
];

export default function Home({navigation}) {
    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.cardsContainer}>
                <Text style={styles.title}>Все файлы</Text>

                <View style={styles.cardsFlatListWrap}>
                    <FlatList
                        data={files}
                        horizontal
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <BookCard title={item.name} description={item.description} imgUri={item.uri}
                                      onPress={() => console.log("Opening file", item)}/>
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardsFlatListContent}
                    />
                </View>

                <Text style={styles.title}>Продолжить работу</Text>
                <View style={styles.bigCardWrap}>
                    <BookCard title="Очень умная книга" description="Some smart book idk fr. I love this stupid book" variant="big"/>
                </View>
            </View>
            {/*<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "position"} >*/}
                <View style={styles.actionsContainer}>


                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Editor")}>
                        <Text style={styles.buttonText}>✎</Text>
                    </TouchableOpacity>
                    {/*<TextInput style={styles.input}></TextInput>*/}
                </View>
            {/*</KeyboardAvoidingView>*/}
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
