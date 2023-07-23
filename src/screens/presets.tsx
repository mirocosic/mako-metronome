import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../store"

const Presets = ({navigation}) => {
  const presets = useSelector(state => state.presets)
  const dispatch = useDispatch()

  return (
    <SafeAreaView>
      {
        presets.map((preset, idx) => {
          return (
            <TouchableOpacity
              onPress={() => {
                dispatch(actions.setVibrate(preset.vibrate ? true : false))
                dispatch(actions.loadTempo(Number(preset.tempo)))
                navigation.goBack()
              }}
              key={idx} style={{margin: 10, borderBottomColor: "lightgray", borderBottomWidth: 1, padding: 10}}>
              <Text style={{fontWeight: "bold"}}>{preset.name}</Text>
              <Text style={{fontSize: 11}}>Tempo: {preset.tempo}, Vibrate: {preset.vibrate ? "True" : "False"}</Text>
            </TouchableOpacity>
          )
        })
      }

      <TouchableOpacity
        onPress={() => {
          dispatch(actions.clearPresets())
        }}
        style={{margin: 10, borderBottomColor: "lightgray", borderBottomWidth: 1, padding: 10}}>
        <Text style={{fontWeight: "bold"}}>Clear all presets</Text>
        
      </TouchableOpacity>


    </SafeAreaView>
  )
}

export default Presets