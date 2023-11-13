import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { View, TouchableOpacity, StyleSheet, Text, TextInput, NativeModules, Button } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Fontisto from 'react-native-vector-icons/Fontisto'
import * as Haptics from 'expo-haptics'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'
import Copy from "../components/copy"
import palette from '../utils/palette'
import { useDarkTheme } from '../utils/ui-utils'
import { msToBpm, bpmToMs } from '../utils/common'
import { BottomSheetModal,  BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import Slider from '@react-native-community/slider'
import { connectActionSheet } from '@expo/react-native-action-sheet'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated'
import uuid from 'react-native-uuid'

import { useNavigation } from '@react-navigation/native';

import RTNSoundmodule from 'rtn-soundmodule/js/NativeSoundmodule'

const Controls = ({togglePlaying, isPlaying, tempo, indicators, setCurrentIndicatorIdx, sharedValues, bottomSheetModalRef, showActionSheetWithOptions, setPresetDialogVisible}) => {
  const dispatch = useDispatch()
  const tempoRef = useRef(tempo)
  const isDarkMode = useDarkTheme()
  const isVibrateEnabled = useSelector(state => state.settings.vibrate)
  const isSoundEnabled = useSelector(state => state.settings.sound)
  const soundEnabledRef = useRef(isSoundEnabled)
  const indicatorsRef = useRef(indicators)

  const [presetName, setPresetName] = useState("")

  const currentPreset = useSelector(state => state.settings.currentPreset);
  const beats = useSelector(state => state.settings.beats)
  const volume = useSelector(state => state.settings.volume)
  const voice = useSelector(state => state.settings.voice)
  const voiceRef = useRef(voice)

  const [intervalObj, setIntervalObj] = useState(null)
  const [taps, setTaps] = useState([0])
  const [tapMessage, setTapMessage] = useState("")
  const [volumeIndicator, setVolumeIndicator] = useState(volume)
  const theme = useSelector(state => state.settings.theme)

  const navigation = useNavigation();

  const openPresetsMenu = () => {
    showActionSheetWithOptions(
      {
        options: ['Save', 'Save as', 'Cancel'],
        cancelButtonIndex: 2,
        //title: 'Save ',
        userInterfaceStyle: theme,
        containerStyle: {
          backgroundColor: isDarkMode ? palette.dark : palette.light
        },
        tintColor: "teal",
        textStyle: {color: "teal"},
        //textStyle: { color: isDarkMode ? palette.light : palette.dark },
        titleTextStyle: { color: isDarkMode ? palette.lightGray : palette.gray }
      },
      btnIdx => {
        switch (btnIdx) {
          case 0:
            dispatch(
              actions.updatePreset({
                id: currentPreset.id,
                name: currentPreset.name,
                tempo: tempo,
                vibrate: isVibrateEnabled,
                sound: isSoundEnabled,
                volume: volume,
                indicators: indicators
              })
            );
            break;
          case 1:
            //setPresetDialogVisible(true);
            presetRef.current?.present()
            //dispatch(actions.setTheme('dark'));
            break;
          // case 2:
          //   dispatch(actions.setTheme('system'));
          //   break;
          default:
            break;
        }
      }
    );
  };



  const volumeSheetRef = useRef<BottomSheetModal>(null)
  const presetRef = useRef<BottomSheetModal>(null)

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

    let indicatorLevel0Active = indicatorsRef.current[currentIndicatorIdx].levels[0].active
    let indicatorLevel1Active = indicatorsRef.current[currentIndicatorIdx].levels[1].active

    const voice = indicatorLevel1Active ? voiceRef.current + "1" : voiceRef.current

    // first sound
    if (soundEnabledRef.current && indicatorLevel0Active) {
      RTNSoundmodule?.playSound(voice, false)
    }

    currentIndicatorIdx = currentIndicatorIdx + 1 // increment indicator after first sound

    // and then the rest
    let startTime = new Date().getTime();

    const interval = setInterval(() => {
      const diffMs = new Date().getTime() - startTime;

      if (diffMs > bpmToMs(tempoRef.current)) {

        toggleIndicator(currentIndicatorIdx)

        let indicatorLevel0Active = indicatorsRef.current[currentIndicatorIdx].levels[0].active
        let indicatorLevel1Active = indicatorsRef.current[currentIndicatorIdx].levels[1].active

        const voice = indicatorLevel1Active ? voiceRef.current + "1" : voiceRef.current

        if (soundEnabledRef.current && indicatorLevel0Active) {
          RTNSoundmodule?.playSound(voice, false)
        }

        console.log(voiceRef.current)

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
    RTNSoundmodule?.playSound(voiceRef.current, false)
  }

  // update relevant props
  useEffect(() => {
    tempoRef.current = tempo
    soundEnabledRef.current = isSoundEnabled
    indicatorsRef.current = indicators
    voiceRef.current = voice
  }, [tempo, isSoundEnabled, indicators, voice])

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
              color="lightgray"
            />
          </View>
        </TouchableOpacity>

        

        {/* <TouchableOpacity
          onPress={() => dispatch(actions.setVibrate(!isVibrateEnabled))}>
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 14 }}>
              {isVibrateEnabled ? (
                <MaterialCommunityIcons
                  name="vibrate"
                  size={24}
                  color="lightgray"
                />
              ) : (
                <MaterialCommunityIcons
                  name="vibrate-off"
                  size={24}
                  color="lightgray"
                />
              )}
            </Text>
          </View>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => bottomSheetModalRef.current.present()}>
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 14 }}>
              <Fontisto name="heartbeat-alt" size={24} color="lightgray" />
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
                <Ionicons name="pause" size={24} color="teal" />
              ) : (
                <Ionicons name="play" size={24} color="teal" />
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
                <Ionicons name="volume-high" size={24} color="lightgray" />
              ) : (
                <Ionicons name="volume-mute" size={24} color="lightgray" />
              )}
            </Text>
            {/* <Text style={{fontSize: 10}}>{Math.round(volumeIndicator * 100)}% </Text> */}
          </View>
        </TouchableOpacity>

        

        <TouchableOpacity
          //onPress={() => presetRef.current?.present()}
          //onPress={() => {navigation.navigate("PresetModal")}}
          onPress={() => openPresetsMenu()}
          >
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 4 }}>
              <MaterialCommunityIcons name="content-save-outline" size={24} color="lightgray" />
            </Text>
          </View>
        </TouchableOpacity>

      </View>

      <Text style={{color:"black", textAlign: "center"}}>{tapMessage}</Text>
      <View>
        {currentPreset.name !== '' ? (
          <Copy style={{textAlign: "center", color: isDarkMode ? "lightgray" : "gray"}} value={`Preset: ${currentPreset.name}`} />
        ) : null}
      </View>

      <BottomSheetModal
        ref={volumeSheetRef}
        index={0}
        enablePanDownToClose={true}
        snapPoints={[200]}
        backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
        handleIndicatorStyle={{backgroundColor: isDarkMode ? "black" : "black"}}
        backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "#f1f1f1"}}>
        <View style={{flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1}}>
          <Text style={{color: isDarkMode ? "lightgray" : "black" }}>Volume {Math.round(volumeIndicator * 100)}% </Text>
          
          <View style={{flexDirection: "row", alignItems: "center", marginTop: 10}}>
            <Text style={{color: isDarkMode ? "lightgray" : "black" }}>0%</Text>
            <Slider
              style={{width: 250, height: 60}}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              thumbTintColor="teal"
              minimumTrackTintColor="teal"
              maximumTrackTintColor="darkgray"
              onValueChange={(v) => setVolumeIndicator(v)}
              onSlidingComplete={ v => dispatch(actions.setVolume(v)) }/>
            <Text style={{color: isDarkMode ? "lightgray" : "black" }}>100%</Text>
          </View>
          
        </View>
      </BottomSheetModal>

      <BottomSheetModal
        ref={presetRef}
        index={0}
        enablePanDownToClose={true}
        snapPoints={[200]}
        backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
        handleIndicatorStyle={{backgroundColor: isDarkMode ? "teal" : "black"}}
        backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "#f1f1f1"}}>
        <View style={{flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1}}>
          <Text style={{color: isDarkMode ? "lightgray" : "gray", margin: 10}} >Save new preset</Text>
          <BottomSheetTextInput 
            style={{padding: 10, width: 200, margin:10, borderWidth: 1, borderRadius: 6, borderColor: "gray", color: isDarkMode ? "lightgray" : "black"}}
            onChangeText={ v => setPresetName(v) }
            placeholder='Preset name'
            />
          <View style={{flexDirection: "row", marginBottom: 20}}>
            <Button
              color="gray"
              title="Cancel"
              onPress={()=> {
                setPresetName("")
                presetRef.current?.close()}}
            />
            <Button color="teal" title="Save"
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
                presetRef.current?.close()
              }}></Button>
          </View>
          
        </View>
      </BottomSheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonLarge: {
    backgroundColor: 'lightgray',
    width: 60,
    height: 60,
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5
  },

  buttonSmall: {
      backgroundColor: 'teal',
      width: 40,
      height: 40,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 5
  }
})

export default connectActionSheet(Controls)
