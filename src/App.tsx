import React from 'react'
import {Text} from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import palette from './utils/palette';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import Settings from "./screens/settings"
import Metronome from "./screens/metronome"
import Presets from "./screens/presets"
import PresetModal from "./screens/preset-modal"
import SplashScreen from "./screens/splash-screen"

import { PersistGate } from 'redux-persist/integration/react'
import {store, persistor} from './store'
import { Provider } from 'react-redux';
import { useDarkTheme } from './utils/ui-utils';


const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const MainStack = createStackNavigator();

const MetronomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Metronome" component={Metronome} options={{headerShown: false}}/>
      <Stack.Screen
        name="PresetModal"
        component={PresetModal}
        options={{ presentation: 'transparentModal', headerShown: false, animationEnabled: false }}
      />
    </Stack.Navigator>
  )
}

const getColor = (isFocused, isDarkTheme) => {
  if (isFocused && isDarkTheme) { return palette.teal}
  if (isFocused && !isDarkTheme) { return palette.teal}
  if (!isFocused && isDarkTheme) { return "gray"}
  if (!isFocused && !isDarkTheme) { return "gray"}
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
        initialRouteName="Makonome"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: useDarkTheme() ? palette.teal : palette.teal
        }}>
        <Tabs.Screen
          name="Presets"
          component={Presets}
          options={{tabBarIcon: ({focused}) => <Ionicons name="list-outline" size={24} color={getColor(focused, useDarkTheme())} />}}/>
        <Tabs.Screen 
          name="Makonome"
          component={MetronomeStack}
          options={{tabBarIcon: ({focused}) => <MaterialCommunityIcons name="metronome-tick" size={24} color={getColor(focused, useDarkTheme())} />}}/>
        <Tabs.Screen
          name="Settings" 
          component={Settings}
          options={{tabBarIcon: ({focused}) => <Ionicons name="cog-outline" size={24} color={getColor(focused, useDarkTheme())} />}}/>
      </Tabs.Navigator>
    </NavigationContainer>
)}

const TabsNavigator = () => {
  return (
    <Tabs.Navigator
        initialRouteName="Makonome"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: useDarkTheme() ? palette.teal : palette.teal
        }}>
        <Tabs.Screen
          name="Presets"
          component={Presets}
          options={{tabBarIcon: ({focused}) => <Ionicons name="list-outline" size={24} color={getColor(focused, useDarkTheme())} />}}/>
        <Tabs.Screen 
          name="Makonome"
          component={MetronomeStack}
          options={{tabBarIcon: ({focused}) => <MaterialCommunityIcons name="metronome-tick" size={24} color={getColor(focused, useDarkTheme())} />}}/>
        <Tabs.Screen
          name="Settings" 
          component={Settings}
          options={{tabBarIcon: ({focused}) => <Ionicons name="cog-outline" size={24} color={getColor(focused, useDarkTheme())} />}}/>
      </Tabs.Navigator>
  )
}

const MainNavigator = () => {
  return (
    <NavigationContainer theme={useDarkTheme() ? MyDarkTheme : DefaultTheme}>
      <MainStack.Navigator>
        <MainStack.Screen name="SplashScreen" component={SplashScreen} options={{headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid}}/>
        <MainStack.Screen name="TabsNavigator" component={TabsNavigator} options={{headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid}}/>
      </MainStack.Navigator>
    </NavigationContainer>
  )
}

export default function Main() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
          <ActionSheetProvider>
            <BottomSheetModalProvider>
              <AppNavigator />
              {/* <MainNavigator /> */}
            </BottomSheetModalProvider>
          </ActionSheetProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  )
}
