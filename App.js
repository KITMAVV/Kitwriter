import React, { useEffect } from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Home from "./src/screens/Home";
import Editor from "./src/screens/Editor";
import ChapterList from "./src/screens/ChaptersList";

import { initDb } from "./src/db/database";

const Stack = createStackNavigator();

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { fontFamily: "Monserat" };

export default function App() {
    useEffect(() => {
        (async () => {
            try {
                await initDb();
                console.log("DB ready");
            } catch (e) {
                console.error("DB init error", e);
            }
        })();
    }, []);


    return (
        <NavigationContainer>
            <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Editor" component={Editor} />
                <Stack.Screen name="ChapterList" component={ChapterList} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
