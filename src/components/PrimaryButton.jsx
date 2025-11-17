import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';


export default function PrimaryButton({ onPress, btnText, variant = 'default', menuItems = [], }) {
    const [open, setOpen] = useState(false);
    const handlePress = () => {
        if (variant === 'menu') {
            setOpen(prev => !prev);
        } else {
            onPress && onPress();
        }
    };
    return(
        <View style={styles.wrapper}>

            {variant === 'menu' && open && (
                <View style={styles.menu}>
                    {menuItems.map((item) => (
                        <Pressable
                            key={item.label}
                            style={styles.menuItem}
                            onPress={() => {
                                setOpen(false);
                                item.onPress && item.onPress();
                            }}
                        >
                            <Text style={styles.menuItemText}>{item.label}</Text>
                        </Pressable>
                    ))}
                </View>
            )}

            <Pressable
                onPress={handlePress}
                style={({ pressed }) => [
                    styles.btn,
                    pressed ? styles.btnPressed : null,
                ]}
            >
                {btnText ? <Text style={styles.btnText}>{btnText}</Text> : null}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    btn: {
        backgroundColor: "#fff",
        width: "100%",
        height: "100%",
        marginHorizontal: 4,

        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    btnPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.97 }],
    },
    btnText: {
        fontSize: 11,
    },
    menu: {
        position: 'absolute',
        bottom: 55,
        left: -5,
        padding: 6,
        borderRadius: 15,
        backgroundColor: '#fff',
        flexDirection: 'row',
        gap: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    menuItem: {

        alignItems: "center",
        justifyContent: "center",
        width: 52,
        paddingVertical: 12,
        borderRadius: 7,
        backgroundColor: '#E6E6E6FF',
    },
    menuItemText: {
        fontSize: 10,
    },
})
