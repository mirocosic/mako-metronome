import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { View, TouchableOpacity, StyleSheet, Text, TextInput, NativeModules } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Fontisto from 'react-native-vector-icons/Fontisto'
import * as Haptics from 'expo-haptics'
import { useSelector, useDispatch } from 'react-redux'
import { Audio } from 'expo-av'
import { actions } from '../store'
import { useDarkTheme } from '../utils/ui-utils'
import { msToBpm, bpmToMs } from '../utils/common'
import { BottomSheetModal,  BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import Slider from '@react-native-community/slider'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated'

import RTNSoundmodule from 'rtn-soundmodule/js/NativeSoundmodule'

const Controls = ({togglePlaying, isPlaying, tempo, indicators, setCurrentIndicatorIdx, sharedValues, bottomSheetModalRef}) => {
  const dispatch = useDispatch()
  const tempoRef = useRef(tempo)
  const isDarkMode = useDarkTheme()
  const isVibrateEnabled = useSelector(state => state.settings.vibrate)
  const isSoundEnabled = useSelector(state => state.settings.sound)
  const soundEnabledRef = useRef(isSoundEnabled)
  const indicatorsRef = useRef(indicators)

  const beats = useSelector(state => state.settings.beats)
  const volume = useSelector(state => state.settings.volume)
  const voice = useSelector(state => state.settings.voice)

  const [intervalObj, setIntervalObj] = useState(null)
  const [taps, setTaps] = useState([0])
  const [tapMessage, setTapMessage] = useState("")
  const [volumeIndicator, setVolumeIndicator] = useState(volume)

  const volumeSheetRef = useRef<BottomSheetModal>(null)

  const toggleIndicator = (currentIndicatorIdx) => {

    const newValues = sharedValues.value.map((v, idx) => {
      if (idx === currentIndicatorIdx) {
        return 1
      } else {
        return 0
      }
    })

    sharedValues.value = withTiming(newValues, {duration: 50})

    setTimeout(() => {
      const clearValues = sharedValues.value.map((v, idx) => {
        return 0
      })
      sharedValues.value = withTiming(clearValues, {duration: 50})
    }, 100)

  }

  const loop = useCallback((setIntervalObj) => {
    togglePlaying(true)
    let currentIndicatorIdx = 0

    //trigger first indicator
    toggleIndicator(currentIndicatorIdx)

    // first sound
    if (soundEnabledRef.current) {
      RTNSoundmodule?.playSound("JSI call")
    }

    currentIndicatorIdx = currentIndicatorIdx + 1 // increment indicator after first sound

    // and then the rest
    let startTime = new Date().getTime();

    const interval = setInterval(() => {
      const diffMs = new Date().getTime() - startTime;

      if (diffMs > bpmToMs(tempoRef.current)) {

        console.log(currentIndicatorIdx)
        toggleIndicator(currentIndicatorIdx)

        if (soundEnabledRef.current) {
          RTNSoundmodule?.playSound("JSI call")
        }

        currentIndicatorIdx = currentIndicatorIdx + 1 // increment indicator after sound

        startTime = new Date().getTime() // reset start time

        if (currentIndicatorIdx >= indicatorsRef.current.length) {
          currentIndicatorIdx = 0 // reset indicator
        }
      }

    }, 1)

    setIntervalObj(interval)


  }, [tempo])

  const stopLoop = useCallback((interval) => {
    console.log("loop stooped")
    togglePlaying(false)
    clearInterval(interval)
  }, [])

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

  function playNativeSound() {
    RTNSoundmodule?.playSound("JSI call")
  }

  // update relevant props
  useEffect(() => {
    tempoRef.current = tempo
    soundEnabledRef.current = isSoundEnabled
    indicatorsRef.current = indicators
  }, [tempo, isSoundEnabled, indicators])

  console.log("render controls")
  //console.log(sharedValues.length)

  return (
    <View>

      <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            getTapTempo()
            if (!isPlaying) {
              playNativeSound()
            }
          }}>
          <View style={styles.buttonSmall}>
            <MaterialCommunityIcons
              name="gesture-double-tap"
              size={24}
              color="black"
            />
          </View>
        </TouchableOpacity>

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

        <TouchableOpacity onPress={() => {
          if (!isPlaying) 
            {loop(setIntervalObj)} 
            else 
            { stopLoop(intervalObj)}}}>
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
            {/* <Text style={{fontSize: 10}}>{Math.round(volumeIndicator * 100)}% </Text> */}
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

      <Text style={{color:"black", textAlign: "center"}}>{tapMessage}</Text>

      <BottomSheetModal
        ref={volumeSheetRef}
        index={0}
        enablePanDownToClose={true}
        snapPoints={[200]}
        backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
        handleIndicatorStyle={{backgroundColor: isDarkMode ? "black" : "black"}}
        backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "#f1f1f1"}}>
        <View style={{flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1}}>
          <Text style={{color: isDarkMode ? "black" : "black" }}>Volume {Math.round(volumeIndicator * 100)}% </Text>
          
          <View style={{flexDirection: "row", alignItems: "center", marginTop: 10}}>
            <Text style={{color: isDarkMode ? "black" : "black" }}>0%</Text>
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
            <Text style={{color: isDarkMode ? "black" : "black" }}>100%</Text>
          </View>
          
        </View>
      </BottomSheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonLarge: {
    backgroundColor: 'lightblue',
    width: 60,
    height: 60,
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5
  },

  buttonSmall: {
      backgroundColor: 'lightblue',
      width: 40,
      height: 40,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 5
  }
})

export default Controls;
