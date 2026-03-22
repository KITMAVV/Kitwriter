import {StyleSheet, Text, TouchableOpacity, View} from "react-native";

export default function ListCard({ title, content, onPress, showDrag = false, showDelete = false }) {
    
    return(
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {showDrag && (
                <Text>|||</Text>
            )}
            
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{title}</Text>
                {content ? (
                    <Text style={styles.contentText}>{content}</Text>
                ) : null }
            </View>


            {/* Actions */}
            <View style={styles.actionContainer}>
                <Text>Comm</Text>
                <Text>✎</Text>

                {showDelete && (
                    <Text>Del</Text>
                )}
            </View>

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 10,
        width: "auto",
        height: 90,
    },
    
    title: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    contentText: {
        fontSize: 13,
        color: "#444",
    },
})
