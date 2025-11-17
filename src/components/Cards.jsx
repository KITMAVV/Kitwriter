import {StyleSheet, Text, TouchableOpacity, Image, View} from "react-native";

export default function BookCard({ title, imgUri, description, onPress, variant = "default", }) {
    const isBig = variant === "big";
    return(
        <TouchableOpacity style={[styles.card, isBig && styles.cardBig]} onPress={onPress} activeOpacity={0.8}>
            {imgUri ? (
                <Image style={styles.image} source={{ uri: imgUri }} />
            ) : (
                <View style={styles.imagePlaceholder} />
            )}

            <Text style={styles.title}>{title}</Text>
            {description ? (
                <Text style={styles.description}>{description}</Text>
            ) : null }
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 10,
        width: 165,
        height: 245,
    },
    cardBig: {
        width: "100%",
        height: 285,
    },
    image: {
        width: "100%",
        height: 160,
        borderRadius: 8,
        marginBottom: 8,
    },
    imagePlaceholder: {
        width: "100%",
        height: 160,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: "#9e9e9e",
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: "#444",
    },
})
