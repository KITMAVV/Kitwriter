import {StyleSheet, Text, Pressable, View} from "react-native";

export default function ListCard({ title, content, onPress, onCommentPress, onEditPress, onDeletePress, showDrag = false, showDelete = false }) {
    
    return(
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.dragContainer}>
                {showDrag && <Text>|||</Text>}
            </View>
            
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{title}</Text>
                {content ? (
                    <Text style={styles.contentText} numberOfLines={1} ellipsizeMode="tail">{content.replace(/\n/g, " ")}</Text>
                ) : null }
            </View>


            {/* Actions */}
            <View style={styles.actionContainer}>
                <Pressable onPress={onCommentPress} style={styles.actionBtn}>
                    <Text>💬</Text>
                </Pressable>

                <Pressable onPress={onEditPress} style={styles.actionBtn}>
                    <Text>✎</Text>
                </Pressable>

                {showDelete && (
                    <Pressable onPress={onDeletePress} style={styles.actionBtn}>
                        <Text>🗑️</Text>
                    </Pressable>
                )}
            </View>

        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 10,
        width: "auto",
        flexDirection: "row",
        
        alignItems: "center",
        gap: 6,
        
        minHeight: 80,
    },
    
    title: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    contentText: {
        fontSize: 12,
        color: "#6e6e6e",
    },
    infoContainer: {
        flex: 1,
        flexShrink: 1,
        marginRight: 20,
    },
    actionContainer: {
        flexDirection: "row",
        justifyContent: 'space-between',
        gap: 10,
        alignItems: "center",
    },
    
    dragContainer: {
        width: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    actionBtn: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: "#ffffffde",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#a1a1a1",
    },
})
