import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";

import Home from "./src/screens/Home";
import Editor from "./src/screens/Editor";

const Stack = createStackNavigator();

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { fontFamily: "Monserat" };

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Editor" component={Editor} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
