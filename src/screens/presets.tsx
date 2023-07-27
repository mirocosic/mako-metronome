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

import Copy from "../components/copy"

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
              }}
              key={idx} style={{margin: 10, borderBottomColor: "lightgray", borderBottomWidth: 1, padding: 10}}>
              <Copy style={{fontWeight: "bold"}} value={preset.name} />
              <Copy style={{fontSize: 11}} value={`Tempo: ${preset.tempo}, Vibrate: ${preset.vibrate ? "True" : "False"}`} />
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
        <Copy style={{fontWeight: "bold"}} value="Clear all presets" />
        
      </TouchableOpacity>


    </SafeAreaView>
  )
}

export default Presets