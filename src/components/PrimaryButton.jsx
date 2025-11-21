import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';


export default function PrimaryButton({ onPress, btnText, btnWidth = "100%", variant = 'default', menuItems = [], }) {
    const [open, setOpen] = useState(false);
    const handlePress = () => {
        if (variant === 'menu' || variant === 'menu-burger') {
            setOpen(prev => !prev);
        } else {
            onPress && onPress();
        }
    };
    return(
        <View style={[styles.wrapper, { width: btnWidth }]}>

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

            {variant === 'menu-burger' && open && (
                <View style={styles.menuBurger}>
                    {menuItems.map((item) => (
                        <Pressable
                            key={item.label}
                            style={styles.menuBurgerItem}
                            onPress={() => {
                                setOpen(false);
                                item.onPress && item.onPress();
                            }}
                        >
                            <Text style={styles.menuBurgerItemText}>{item.label}</Text>
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
        flexShrink: 1,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    btn: {
        backgroundColor: "#fff",
        height: "100%",
        width: "100%",
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#dcdcdc",
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


    menuBurger: {
        position: 'absolute',
        top: 75,
        right: 0,
        padding: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    menuBurgerItem: {
        alignItems: "center",
        justifyContent: "center",
        width: 140,
        paddingVertical: 14,
        borderRadius: 15,
        backgroundColor: '#E6E6E6FF',
    },
    menuBurgerItemText: {
        fontSize: 10,
    },
})
