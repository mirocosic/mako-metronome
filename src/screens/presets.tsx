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
      <ScrollView>
      {
        presets.map((preset, idx) => {
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => {
                dispatch(actions.setVibrate(preset.vibrate ? true : false))
                dispatch(actions.loadTempo(Number(preset.tempo)))
                dispatch(actions.setVolume(preset.volume))
                dispatch(actions.toggleSound(preset.sound ? true : false))
                dispatch(actions.loadIndicators(preset.indicators))
                dispatch(actions.setCurrentPreset(preset))
                navigation.navigate("Metronome")
              }}
              style={{margin: 10, borderBottomColor: "lightgray", borderBottomWidth: 1, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                <View>
                  <Copy style={{fontWeight: "bold"}} value={preset.name} />
                  <Copy
                    style={{fontSize: 11}}
                    value={`Tempo: ${preset.tempo}, Vibrate: ${preset.vibrate ? "True" : "False"}, Sound: ${preset.sound ? "On" : "Off"}, Volume: ${Math.round(preset.volume * 100)}`} />
                </View>
                <View>
                  <TouchableOpacity onPress={() => {dispatch(actions.deletePreset(preset.id))}} >
                    <Copy style={{color: "red"}} value="Delete" />
                  </TouchableOpacity>
                </View>
                
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

      </ScrollView>
    </SafeAreaView>
  )
}

export default Presets