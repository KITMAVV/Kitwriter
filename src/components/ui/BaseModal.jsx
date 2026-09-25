import React from 'react';
import {Modal, Pressable, StyleSheet} from "react-native";

export default function BaseModal({children, onClose, visible}) {


    return(
        <Modal transparent={true} animationType={"slide"} visible={visible} onClose={onClose} onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.modal} onPress={(event) => event.stopPropagation()}>
                    {children}
                </Pressable>
            </Pressable>

        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
      backgroundColor: "rgba(0,0,0,0.25)",
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    modal: {
        width: '100%',
        maxWidth: 520,
        maxHeight: '85%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 24,
    },
})
