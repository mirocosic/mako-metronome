import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'
import uuid from 'react-native-uuid'
import Dialog from "react-native-dialog"

const SaveDialog = (props) => {

  const dispatch = useDispatch()

  const [presetName, setPresetName] = useState("")

  const isVibrateEnabled = useSelector(state => state.settings.vibrate)
  const isSoundEnabled = useSelector(state => state.settings.sound)
  const tempo = useSelector((state) => state.tempo.value)
  const volume = useSelector(state => state.settings.volume)
  const indicators = useSelector(state => state.indicators)

  return (
    <Dialog.Container visible={props.isPresetDialogVisible}>
      <Dialog.Title>Save preset</Dialog.Title>
      <Dialog.Description>
        Save this current settings as a new preset?
      </Dialog.Description>
      <Dialog.Input onChangeText={ v => setPresetName(v) } />
      <Dialog.Button label="Cancel" 
        onPress={() => {
          props.setPresetDialogVisible(false)
          setPresetName("")
        }} />
      <Dialog.Button
        label="Save"
        bold={true}
        disabled={presetName ===  ""}
        onPress={() => {
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
          props.setPresetDialogVisible(false)
        }}/>
    </Dialog.Container>
  )
}

export default SaveDialog