import React, { useState } from 'react';
import { View, TextInput, Button, SafeAreaView, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'
import uuid from 'react-native-uuid'
import Dialog from "react-native-dialog"
import { useDarkTheme } from '../utils/ui-utils'

const PresetModal = ({navigation}) => {
  const [text, setText] = useState('');

  const handleInputChange = (value: string) => {
    setText(value);
  };

  const handleButtonPress = () => {
    // handle button press logic here
  };

  const dispatch = useDispatch()

  const [presetName, setPresetName] = useState("")

  const isDarkMode = useDarkTheme()

  const isVibrateEnabled = useSelector(state => state.settings.vibrate)
  const isSoundEnabled = useSelector(state => state.settings.sound)
  const tempo = useSelector((state) => state.tempo.value)
  const volume = useSelector(state => state.settings.volume)
  const indicators = useSelector(state => state.indicators)

  return (
    <SafeAreaView style={{flex: 1, height: "100%"}}>
      <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
        <View style={{position: "absolute", backgroundColor: "black", flex: 1, width: "100%", height: "100%", opacity: 0.5}}></View>
        <View style={{width: 260, height: 200, padding: 20, borderRadius: 10, backgroundColor: isDarkMode ? "#1f1f1f" : "white"}}>

          <Text style={{textAlign: "center", margin: 10, padding: 10, fontSize: 20, color: "lightgray"}}>Save as new preset</Text>

          <TextInput
            style={{height: 40, borderColor: 'gray', borderRadius: 6, borderWidth: 1, padding:10, color: isDarkMode ? "lightgray" : "black"}}
            onChangeText={ v => setPresetName(v) }
            placeholder='Preset name'
            />
          <View style={{flexDirection: "row", justifyContent: "space-evenly", marginTop: 20}}>

          
          <Button
            title="Cancel"
            color="gray"
            onPress={() => {
              //props.setPresetDialogVisible(false)
              navigation.goBack()
              setPresetName("")
              }}
          />
          <Button
            title="Save" 
            color="teal"
            onPress={() => {
              if (presetName === "") return
              const preset = {
                id: uuid.v4(),
                name: presetName,
                tempo: tempo,
                vibrate: isVibrateEnabled,
                sound: isSoundEnabled,
                volume: volume,
                indicators: indicators
              } 
              dispatch(actions.savePreset(preset))
              dispatch(actions.setCurrentPreset(preset))
              setPresetName("")
              navigation.goBack()
              //props.setPresetDialogVisible(false)
            }}/>
          </View>
        </View>
        
      </View>
    </SafeAreaView>
  );
};

export default PresetModal
