import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text, TextInput } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'
import { useDarkTheme } from '../utils/ui-utils'

const Controls = ({togglePlaying, isPlaying, getTapTempo, playExpoSound}) => {
  const dispatch = useDispatch()
  const isDarkMode = useDarkTheme()
  const isVibrateEnabled = useSelector(state => state.settings.vibrate)
  const isSoundEnabled = useSelector(state => state.settings.sound)
  const beats = useSelector(state => state.settings.beats)

  return (
    <View style={{ flexDirection: 'column' }}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => togglePlaying(!isPlaying)}>
          <View style={styles.buttonLarge}>
            <Text style={{ color: 'black', fontSize: 20 }}>
              {isPlaying ? (
                <Ionicons name="pause" size={24} color="black" />
              ) : (
                <Ionicons name="play" size={24} color="black" />
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            getTapTempo()
            playExpoSound(false)
          }}>
          <View style={styles.buttonLarge}>
            <MaterialCommunityIcons
              name="gesture-double-tap"
              size={24}
              color="black"
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <TouchableOpacity
          onPress={() => dispatch(actions.setVibrate(!isVibrateEnabled))}>
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 14 }}>
              {isVibrateEnabled ? (
                <MaterialCommunityIcons
                  name="vibrate"
                  size={24}
                  color="black"
                />
              ) : (
                <MaterialCommunityIcons
                  name="vibrate-off"
                  size={24}
                  color="black"
                />
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => dispatch(actions.toggleSound(!isSoundEnabled))}>
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 14 }}>
              {isSoundEnabled ? (
                <Ionicons name="volume-high" size={24} color="black" />
              ) : (
                <Ionicons name="volume-mute" size={24} color="black" />
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <TextInput
          style={{
            color: isDarkMode ? 'white' : 'black',
            fontSize: 20,
            padding: 10,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 10,
            width: 50,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
          keyboardType="number-pad"
          returnKeyType={'done'}
          value={beats}
          onChangeText={v => {
            dispatch(actions.setBeats(v));
          }}
          onSubmitEditing={v => {
            dispatch(actions.setIndicators(Number(beats)));
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonLarge: {
    backgroundColor: 'lightblue',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10
  },

  buttonSmall: {
      backgroundColor: 'lightblue',
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      margin: 10
  }
})

export default Controls;
