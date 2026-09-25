import {StyleSheet, ScrollView, View} from "react-native";
import EditorActionButton from "./EditorActionButton";


export default function EditorActions() {

    return (
        <View style={styles.positioner} pointerEvents="box-none">
            <View style={styles.body}>
                <ScrollView keyboardShouldPersistTaps="always" horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionContent} overScrollMode="always" style={styles.scroll}>
                    <EditorActionButton btnText={"↶"} onPress={() => console.log("Undo")}/>
                    <EditorActionButton btnText={"↷"} onPress={() => console.log("Redo")}/>
                    <EditorActionButton btnText={"B"} onPress={() => console.log("Bold")}/>
                    <EditorActionButton btnText={"I"} onPress={() => console.log("Italic")}/>

                    <EditorActionButton btnText={"—“Quote“"} onPress={() => console.log("Quote")}/>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    positioner: {

        paddingBottom: 20,
        alignItems: "center",
    },

    body: {
        maxWidth: "90%",
        borderRadius: 25,
        borderColor: "#dfdfdf",
        backgroundColor: '#f4f4f4',
        borderWidth: 1,

    },

    scroll: {
        height: 50,
    },
    actionContent: {
        alignItems: 'stretch',
        gap: 5,
    },
})

