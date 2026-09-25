import {Pressable, Text, StyleSheet} from "react-native";

export default function EditorActionButton({onPress, icon, btnText}) {

    return(
        <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed,]}>
            {icon ? icon : <Text style={styles.btnText}>{btnText}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {

        minWidth: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderRadius: 25,
    },

    btnText: {
        fontWeight: "bold",
    },

    btnPressed: {
        backgroundColor: "#ededed",
        opacity: 0.7,

        transform: [{ scale: 0.97 }],
    },
})
