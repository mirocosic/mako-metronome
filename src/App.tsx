import React from 'react'
import {Text} from 'react-native'


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Settings from "./screens/settings"
import Metronome from "./screens/metronome"
import Presets from "./screens/presets"

import { PersistGate } from 'redux-persist/integration/react'
import {store, persistor} from './store'
import { Provider } from 'react-redux';



const Stack = createNativeStackNavigator();


export default function Main() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Metronome">
            <Stack.Screen name="Home" component={Metronome} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Presets" component={Presets} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  )
}
