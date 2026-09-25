import BasePopover from "../ui/BasePopover";
import {Text, TextInput, StyleSheet, View, Pressable} from "react-native";
import React, {useEffect, useRef, useState} from "react";

export default function PopoverWordCount({visible, anchorRef, onClose, onSave, defaultText, defaultChapterCount, variant = "chapter",}) {

    const [value, setValue] = useState("");
    const [chapterCount, setChapterCount] = useState("");

    const chapterCountRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setValue(String(defaultText ?? ""));
            setChapterCount(String(defaultChapterCount ?? ""));
        }
    }, [visible, defaultText, defaultChapterCount]);

    function handleClose() {
        onSave(
            value,
            variant === "book" ? chapterCount : null
        );

        onClose();
    }

    function handleWordCountSubmit() {
        if (variant === "book") {
            chapterCountRef.current?.focus();
            return;
        }

        handleClose();
    }


    return(
        <BasePopover
            visible={visible}
            anchorRef={anchorRef}
            onClose={handleClose}
            placement="bottom-start"
            offset={variant === "book" ? 11 : 13}
            crossAxisOffset={-3}
            popoverStyle={[
                styles.popoverWord,
                variant === "book" && styles.popoverBook,
            ]}
        >
            <TextInput style={styles.input} placeholderTextColor="#888888" placeholder={variant === "book" ? "Цель по словам..." : "Цель по словам..."} keyboardType="number-pad" value={value} onChangeText={setValue} onSubmitEditing={handleWordCountSubmit}/>

            {variant === "book" && (
                <TextInput ref={chapterCountRef} placeholderTextColor="#888888" style={styles.input} placeholder="Ожидаемое глав..." keyboardType="number-pad" value={chapterCount} onChangeText={setChapterCount} onSubmitEditing={handleClose}/>
            )}

            <Text style={styles.hint}>Сохранится автоматически</Text>

        </BasePopover>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#c8c8c8",
        backgroundColor: "#f6f5f5",
        padding: 10,
        borderRadius: 15,
        fontWeight: "300"

    },
    popoverWord: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: "#f4f4f4",
        padding: 9,
        borderColor: "#e1e1e1",
        borderWidth: 1,
        borderTopWidth: 0,
    },
    popoverBook: {
        backgroundColor: "#EFEFEFFF",
        gap: 5,
    },
    hint: {
        fontSize: 12,
        fontStyle: "italic",
        color: "#818181",
        paddingLeft: 5,
        paddingTop: 5,

    },

})
