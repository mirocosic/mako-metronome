import React, { useEffect, useState, useRef } from 'react'
import { View, TouchableOpacity, StyleSheet, Text, TextInput } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Ionicons, Fontisto } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSelector, useDispatch } from 'react-redux'
import { Audio } from 'expo-av'
import { actions } from '../store'
import { useDarkTheme } from '../utils/ui-utils'
import { msToBpm, bpmToMs } from '../utils/common'
import { BottomSheetModal,  BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import Slider from '@react-native-community/slider'

const Controls = ({togglePlaying, isPlaying, tempo, indicators, setCurrentIndicatorIdx, bottomSheetModalRef}) => {
  const dispatch = useDispatch()
  const isDarkMode = useDarkTheme()
  const isVibrateEnabled = useSelector(state => state.settings.vibrate)
  const isSoundEnabled = useSelector(state => state.settings.sound)
  const beats = useSelector(state => state.settings.beats)
  const volume = useSelector(state => state.settings.volume)
  const voice = useSelector(state => state.settings.voice)
  const [sound, setSound] = React.useState()
  const [taps, setTaps] = useState([0])
  const [tapMessage, setTapMessage] = useState("")
  const [volumeIndicator, setVolumeIndicator] = useState(volume)

  const volumeSheetRef = useRef<BottomSheetModal>(null)

  const getTapTempo = () => {

    const lastTap = taps[taps.length - 1]

    if (lastTap === 0) {
      setTaps([Date.now()])
      setTapMessage("Keep tapping")
      return;
    } else if ( (Date.now() - lastTap) > 3000 ) {
      setTaps([Date.now()])
      setTapMessage("Keep tapping")
      return;
    } else {
      const diff1 = Date.now() - lastTap
      const diff2 = lastTap - taps[taps.length - 2]
      const diff3 = taps[taps.length - 2] - taps[taps.length - 3]

      const avgTaps = (diff1 + diff2 + diff3) / 3

      setTaps([...taps, Date.now()])
    
      if (avgTaps) {
        setTapMessage("")  
        dispatch(actions.saveTempo(msToBpm(avgTaps)))
      }
    }
  }


  async function playExpoSound(isAccented) {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    
    
    let soundAsset = null

    switch(voice) {
      case "click":
        soundAsset = isAccented ? require('../../assets/click4.mp3') : require('../../assets/click3.mp3')
        break;
      case "clave":
        soundAsset = isAccented ? require('../../assets/clave.mp3') : require('../../assets/clave.mp3')
        break;
      default:
        soundAsset = isAccented ? require('../../assets/click4.mp3') : require('../../assets/click3.mp3')
    }

    const { sound } = await Audio.Sound.createAsync(soundAsset)
    setSound(sound)
    await sound.setVolumeAsync(volume)
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound])

  useEffect(() => {

    // clear indicators on play / pause
    let currentIndicatorIdx = 0
    setCurrentIndicatorIdx(0)

    if (!isPlaying) return
    
    const isBeatEnabled = indicators[currentIndicatorIdx].levels[0].active
    const isAccented = indicators[currentIndicatorIdx].levels[1].active


    if (isPlaying) {
      if (isSoundEnabled && isBeatEnabled) {
        playExpoSound(isAccented)
      }
      if (isVibrateEnabled) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}

      // if(currentIndicatorIdx === indicators.length - 1) {
      //   console.log("resetting to 0")
      //   currentIndicatorIdx = 0
      //   setCurrentIndicatorIdx(0)
      // } else {
      //   currentIndicatorIdx = currentIndicatorIdx + 1
      //   setCurrentIndicatorIdx(currentIndicatorIdx)
      // }
    }

    // run interval fn
    const interval = setInterval(() => {
      console.log("interval running")
      const isBeatEnabled = indicators[currentIndicatorIdx].levels[0].active
      const isAccented = indicators[currentIndicatorIdx].levels[1].active

      if (isPlaying) {
        if (isSoundEnabled && isBeatEnabled) {
          playExpoSound(isAccented)
        }
        if (isVibrateEnabled) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}

        if(currentIndicatorIdx === indicators.length - 1) {
          currentIndicatorIdx = 0
          setCurrentIndicatorIdx(0)
        } else {
          currentIndicatorIdx = currentIndicatorIdx + 1
          setCurrentIndicatorIdx(currentIndicatorIdx)
         }
      }

    }, bpmToMs(tempo))

    return () => {
      console.log("clearing interval")
      clearInterval(interval)
    }

  }, [tempo, isPlaying, isVibrateEnabled, isSoundEnabled, indicators, volume, voice])


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
          onPress={() => dispatch(actions.toggleSound(!isSoundEnabled))}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            volumeSheetRef.current?.present()
          }}>
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 14 }}>
              {isSoundEnabled ? (
                <Ionicons name="volume-high" size={24} color="black" />
              ) : (
                <Ionicons name="volume-mute" size={24} color="black" />
              )}
            </Text>
            <Text style={{fontSize: 10}}>{Math.round(volumeIndicator * 100)}% </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => bottomSheetModalRef.current.present()}>
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 14 }}>
              <Fontisto name="heartbeat-alt" size={24} color="black" />
            </Text>
          </View>
        </TouchableOpacity>

      </View>

      <Text style={{color:"white", textAlign: "center"}}>{tapMessage}</Text>

      <BottomSheetModal
        ref={volumeSheetRef}
        index={0}
        enablePanDownToClose={true}
        snapPoints={[200]}
        backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
        handleIndicatorStyle={{backgroundColor: isDarkMode ? "white" : "black"}}
        backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "#f1f1f1"}}>
        <View style={{flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1}}>
          <Text style={{color: isDarkMode ? "white" : "black" }}>Volume {Math.round(volumeIndicator * 100)}% </Text>
          
          <View style={{flexDirection: "row", alignItems: "center", marginTop: 10}}>
            <Text style={{color: isDarkMode ? "white" : "black" }}>0%</Text>
            <Slider
              style={{width: 250, height: 60}}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              thumbTintColor="lightblue"
              minimumTrackTintColor="lightblue"
              maximumTrackTintColor="darkgray"
              onValueChange={(v) => setVolumeIndicator(v)}
              onSlidingComplete={ v => dispatch(actions.setVolume(v)) }/>
            <Text style={{color: isDarkMode ? "white" : "black" }}>100%</Text>
          </View>
          
        </View>
      </BottomSheetModal>
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
