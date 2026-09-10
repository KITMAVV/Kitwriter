import {
    StyleSheet,
    Text,
    Pressable,
    View,
    TextInput,
} from "react-native";

import React, { useState } from "react";
import Checkbox from "./Checkbox";

export default function ListCard({
    title,
    content,
    onPress,
    onCommentPress,
    onEditPress,
    onDeletePress,
    onTrashRestorePress,
    mode = "default",
    onDrag,
    isSelected = false,
    onSelectPress,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);

    const isDefault = mode === "default";
    const isDrag = mode === "drag";
    const isDelete = mode === "delete";
    const isTrash = mode === "trash";


    function handleSave() {
        const trimmed = editTitle.trim();

        if (!trimmed) {
            setIsEditing(false);
            setEditTitle(title);
            return;
        }

        onEditPress(trimmed);
        setIsEditing(false);
    }

    return (
        <Pressable
            style={styles.card}
            onPress={ isDrag ? undefined : isTrash ? onSelectPress : onPress }
            onLongPress={isDrag ? onDrag : undefined}
            delayLongPress={200}
        >
            <View style={styles.leadingContainer}>
                {isDrag && <Text>|||</Text>}
                {isTrash && <Checkbox isSelected={isSelected} />}
            </View>

            <View style={styles.infoContainer}>
                {isEditing ? (
                    <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        style={styles.titleInput}
                        autoFocus
                        onBlur={handleSave}
                    />
                ) : (
                    <Text style={styles.title}>{title}</Text>
                )}

                {content ? (
                    <Text
                        style={styles.contentText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {content.replace(/\n/g, " ")}
                    </Text>
                ) : null}
            </View>

            {/* Actions */}

            <View style={styles.actionContainer}>
                {isDefault && (
                    <>
                        <Pressable
                            onPress={onCommentPress}
                            style={styles.actionBtn}
                        >
                            <Text>💬</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                if (isEditing) {
                                    handleSave();
                                } else {
                                    setEditTitle(title);
                                    setIsEditing(true);
                                }
                            }}
                            style={styles.actionBtn}
                        >
                            {isEditing ? <Text>✔</Text> : <Text>✎</Text>}
                        </Pressable>
                    </>
                )}

                {isDelete && (
                    <Pressable
                        onPress={onDeletePress}
                        style={styles.actionBtn}
                    >
                        <Text>🗑️</Text>
                    </Pressable>
                )}

                {isTrash && (
                    <Pressable
                        onPress={onTrashRestorePress}
                        style={styles.actionBtn}
                    >
                        <Text>↺</Text>
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
        marginBottom: 14,
    },

    title: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },

    titleInput: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
        padding: 0,
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
        justifyContent: "space-between",
        gap: 10,
        alignItems: "center",
    },

    leadingContainer: {
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
});