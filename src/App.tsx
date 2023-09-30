import React from 'react'
import {Text} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

import Settings from "./screens/settings"
import Metronome from "./screens/metronome"
import Presets from "./screens/presets"

import { PersistGate } from 'redux-persist/integration/react'
import {store, persistor} from './store'
import { Provider } from 'react-redux';
import { useDarkTheme } from './utils/ui-utils';


const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const getColor = (isFocused, isDarkTheme) => {
  if (isFocused && isDarkTheme) { return "lightgray"}
  if (isFocused && !isDarkTheme) { return "blue"}
  if (!isFocused && isDarkTheme) { return "gray"}
  if (!isFocused && !isDarkTheme) { return "black"}
}

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'rgb(15, 15, 15)',
  },
};

const AppNavigator = () => {

  return (
  <NavigationContainer theme={useDarkTheme() ? MyDarkTheme : DefaultTheme}>
      <Tabs.Navigator
        initialRouteName="Metronome"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: useDarkTheme() ? "lightgray" : "blue"
        }}>
        <Tabs.Screen
          name="Presets"
          component={Presets}
          options={{tabBarIcon: ({focused}) => <Ionicons name="md-list" size={24} color={getColor(focused, useDarkTheme())} />}}/>
        <Tabs.Screen 
          name="Metronome"
          component={Metronome}
          options={{tabBarIcon: ({focused}) => <MaterialCommunityIcons name="metronome-tick" size={24} color={getColor(focused, useDarkTheme())} />}}/>
        <Tabs.Screen
          name="Settings" 
          component={Settings}
          options={{tabBarIcon: ({focused}) => <Ionicons name="ios-settings" size={24} color={getColor(focused, useDarkTheme())} />}}/>
      </Tabs.Navigator>
    </NavigationContainer>
)}

export default function Main() {

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <ActionSheetProvider>
          <AppNavigator />
        </ActionSheetProvider>
      </PersistGate>
    </Provider>
  )
}
