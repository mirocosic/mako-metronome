import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../store"
import { Ionicons } from '@expo/vector-icons'
import Copy from "../components/copy"

const Presets = ({navigation}) => {
  const presets = useSelector(state => state.presets)
  const dispatch = useDispatch()

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={{flex: 1}}>
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
                  <View style={{flexDirection: "row"}}>
                    { preset.indicators.map((indicator, idx) => {
                      return (
                        <View key={idx} style={{width: 20, height: 20, borderColor: "grey", borderWidth: 1, margin: 5, borderRadius: 5}}>
                          <View style={[{flex: 1}, indicator.levels[1].active && {backgroundColor: "grey"}]}/>
                          <View style={[{flex: 1}, indicator.levels[0].active && {backgroundColor: "grey"}]}/>
                        </View>
                      )
                    })
                    }
                  </View>
                </View>
                <View>
                  <TouchableOpacity onPress={() => {dispatch(actions.deletePreset(preset.id))}}>
                    <Ionicons name="trash" size={24} color="#be4d25" />
                  </TouchableOpacity>
                </View>
                
            </TouchableOpacity>
          )
        })
      }

      <TouchableOpacity
        onPress={() => {
          dispatch(actions.clearPresets({}))
        }}
        style={{margin: 10, borderBottomColor: "lightgray", borderBottomWidth: 1, padding: 10}}>
        <Copy style={{fontWeight: "bold"}} value="Clear all presets" />
        
      </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Presets