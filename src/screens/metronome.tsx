import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import uuid from 'react-native-uuid';

import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons';

import { useDarkTheme } from '../utils/ui-utils'
import Copy from "../components/copy"

import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

import Slider from '@react-native-community/slider';
import Dialog from "react-native-dialog";
import ContextMenu from "react-native-context-menu-view";

import { Audio } from 'expo-av';

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },

  indicatorBox: {
    width: 50, height: 50, 
    borderRadius: 6,
    borderColor: "lightgray", 
    borderWidth: 1,
    margin: 10
  },
  indicatorLevelTop: {
    flex: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  indicatorLevelBottom: {
    flex: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  }
});

const bpmToMs = (bpm: number) => {
  return 1000 / (bpm / 60)
}

const msToBpm = (ms: number) => {
  return Math.round((1000 / ms ) * 60)
}


const Metronome = () => {
  const isDarkMode = useDarkTheme()

  const tempo = useSelector((state) => state.tempo.value)
  const dispatch = useDispatch()

  const backgroundStyle = {
    flex: 1,
    margin: 10
  };

  const ticks = [...Array(300).keys()];

  const scrollRef = useRef()
  const inputRef = useRef()

  const [input, setInput] = useState(100)
  const [isPlaying, togglePlaying] = useState(false)
  const isVibrateEnabled = useSelector(state => state.settings.vibrate)
  const isSoundEnabled = useSelector(state => state.settings.sound)
  const volume = useSelector(state => state.settings.volume)
  const currentPreset = useSelector(state => state.settings.currentPreset)

  const [taps, setTaps] = useState([0])
  const [tapMessage, setTapMessage] = useState("")

  const indicators = useSelector(state => state.indicators)

  const [isPresetDialogVisible, setPresetDialogVisible] = useState(false)
  const [presetName, setPresetName] = useState("")

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

  const rIndicators = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)]

  const makeStyle = (idx: number) => {

    return useAnimatedStyle(() => {

      const backgroundColor = interpolateColor(
        rIndicators[idx].value,
        [0, 1],
        ["gray", "red"]
      );

      return {
        backgroundColor,
      }

    })

  }

  const rStyles = [makeStyle(0), makeStyle(1), makeStyle(2), makeStyle(3)]
  
  const toggleIndicator = (idx: number) => {
    rIndicators[idx].value = withTiming(1, {duration: 50})
    setTimeout(() => {
      rIndicators[idx].value = withTiming(0, {duration: 50})
    }, 100)
  }

  const [sound, setSound] = React.useState();

  async function playExpoSound(isAccented) {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    
    const click = isAccented ? require('../../assets/click4.mp3') : require('../../assets/click3.mp3')
    const { sound } = await Audio.Sound.createAsync(click);
    setSound(sound);
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {

  if (!isPlaying) return

  let currentIndicatorIdx = 0
  const isBeatEnabled = indicators[currentIndicatorIdx].levels[0].active
  const isAccented = indicators[currentIndicatorIdx].levels[1].active


  if (isPlaying) {
    if (isSoundEnabled && isBeatEnabled) {
      playExpoSound(isAccented)
    }
    if (isVibrateEnabled) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    
    toggleIndicator(currentIndicatorIdx)

    if(currentIndicatorIdx === 3) {
      currentIndicatorIdx = 0
    } else {
      currentIndicatorIdx = currentIndicatorIdx + 1
    }
  }

  // run interval fn
  const interval = setInterval(() => {

    const isBeatEnabled = indicators[currentIndicatorIdx].levels[0].active
    const isAccented = indicators[currentIndicatorIdx].levels[1].active

    if (isPlaying) {
      if (isSoundEnabled && isBeatEnabled) {
        playExpoSound(isAccented)
      }
      if (isVibrateEnabled) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}

      toggleIndicator(currentIndicatorIdx)

      if(currentIndicatorIdx === 3) {
        currentIndicatorIdx = 0
      } else {
        currentIndicatorIdx = currentIndicatorIdx + 1
      }
    }

  }, bpmToMs(tempo))

  return () => {
    clearInterval(interval)
  }

  }, [tempo, isPlaying, isVibrateEnabled, isSoundEnabled, indicators])


  // set initial scroll position to initial tempo
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current.scrollTo({x: tempo * 10, y: 0, animated: false})
    }, 0)
  }, [])


  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <KeyboardAvoidingView
        behavior="padding"
        style={{paddingBottom: 50, flex: 1}}>

        <View style={{justifyContent: 'space-evenly', alignItems: "flex-end", flexDirection: "row", alignItems: "center"}}>
          <View style={{flex: 1}}></View>
          <View style={{flex: 1}}>
            {
              currentPreset.name !== ""
              ?
              <Copy value={`Preset: ${currentPreset.name}`}></Copy>
              : null
            }
            
          </View>

          <ContextMenu
            dropdownMenuMode
            actions={[{ title: "Save", subtitle: "Save current preset" }, { title: "Save As ", subtitle: "Save as a new preset" }, { title: "Cancel", destructive: true }]}
            onPress={(e) => {
              switch (e.nativeEvent.index) {
                case 0:
                  dispatch(actions.updatePreset({
                    id: currentPreset.id,
                    name: currentPreset.name,
                    tempo: tempo,
                    vibrate: isVibrateEnabled,
                    sound: isSoundEnabled,
                    volume: volume,
                    indicators: indicators}))
                  break;
                case 1:
                  setPresetDialogVisible(true)
                  break;
              }
            }}

          >
            <View style={{backgroundColor: "lightblue", width: 40, padding: 10, borderRadius: 10, alignItems: "center", margin:10}}>
                <Ionicons name="ios-save" size={16} color="black" />
            </View>
          </ContextMenu>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-evenly",
          }}>

          <View style={{flexDirection: "row"}}>
            {
              indicators.map((indicator, idx: number) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.indicatorBox, indicator.indicating && {borderColor: "teal"}]}
                    onPress={() => dispatch(actions.toggleIndicator({idx}))}>
                      
                    <Animated.View style={[styles.indicatorLevelTop,
                                           indicator.levels[1].active && {backgroundColor: "gray"},
                                           indicator.levels[1].active && rStyles[idx],
                                           ]}/>
                    <Animated.View style={[styles.indicatorLevelBottom,
                                           indicator.levels[0].active && {backgroundColor: "gray"},
                                           indicator.levels[0].active && rStyles[idx],
                                   ]}/>
                  </TouchableOpacity>
                )
              })
            }
          </View>

          <View style={{flexDirection: "column"}}>

            <View style={{flexDirection: "row"}}>

            

              <TouchableOpacity onPress={() => togglePlaying(!isPlaying)}>
                <View style={{backgroundColor: "lightblue", padding: 20, borderRadius: 10, alignItems: "center", margin:10}}>
                  <Text style={{color: "black", fontSize: 20}}>
                  {isPlaying
                    ?
                    <Ionicons name="pause" size={24} color="black" />
                    :
                    <Ionicons name="play" size={24} color="black" />
                    }
                  </Text>
                </View>
              </TouchableOpacity> 

              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                getTapTempo()
                playSound(false)
              }}>
                <View style={{backgroundColor: "lightblue", padding: 20, borderRadius: 10, alignItems: "center", margin: 10}}>
                  <MaterialCommunityIcons name="gesture-double-tap" size={24} color="black" />
                </View>
              </TouchableOpacity> 
            </View>

            <View style={{flexDirection: "row", justifyContent: "center"}}>
              <TouchableOpacity onPress={() => dispatch(actions.setVibrate(!isVibrateEnabled))}>
                <View style={{backgroundColor: "lightblue", padding: 10, borderRadius: 10, alignItems: "center", margin:10}}>
                  <Text style={{color: "black", fontSize: 14}}>
                  {isVibrateEnabled 
                    ?
                    <MaterialCommunityIcons name="vibrate" size={24} color="black" />
                    :
                    <MaterialCommunityIcons name="vibrate-off" size={24} color="black" />
                  }
                  </Text>
                </View>
              </TouchableOpacity> 

              <TouchableOpacity onPress={() => dispatch(actions.toggleSound(!isSoundEnabled))}>
                <View style={{backgroundColor: "lightblue", padding: 10, borderRadius: 10, alignItems: "center", margin:10}}>
                  <Text style={{color: "black", fontSize: 14}}>
                  {isSoundEnabled 
                    ?
                    <Ionicons name="volume-high" size={24} color="black" />
                    :
                    <Ionicons name="volume-mute" size={24} color="black" />
                    }
                  </Text>
                </View>
              </TouchableOpacity> 
            </View>
          </View>

          <View>
            <Text style={{color:"white"}}>{tapMessage}</Text>
          </View>


          <View style={{margin: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>

           <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                scrollRef.current.scrollTo({x: (tempo - 5) * 10, y: 0, animated: true})
                
              }}>
              <Copy style={{fontSize: 25}} value="-5" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                scrollRef.current.scrollTo({x: (tempo - 1) * 10, y: 0, animated: true})
              }}>
              <Copy style={{fontSize: 35}} value="-1" />
            </TouchableOpacity>

            
            <TextInput
              ref={inputRef}
              value={ inputRef.current && inputRef.current.isFocused() ? String(input) : String(tempo)}
              style={{color: isDarkMode ? "white" : "black", fontSize: 40, padding: 10, borderWidth: 1, borderColor: "gray", borderRadius: 10, width: 100, height: 60, alignItems:"center", justifyContent: "center", textAlign: "center"}}
              keyboardType="number-pad"
              returnKeyType={ 'done' }
              onFocus={() => setInput("")}
              onChangeText={(v) => {
                setInput(v)
              }}
              onSubmitEditing={()=>{
                if (Number(input) > 0 && Number(input) < 400) {
                  dispatch(actions.saveTempo(Number(input)))
                  scrollRef.current.scrollTo({x: Number(input) * 10, y: 0, animated: true})
                } else {
                  setInput(String(tempo))
                }
                  
              }}
            />

            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                scrollRef.current.scrollTo({x: (tempo + 1) * 10, y: 0, animated: true})
                
              }}>
              <Copy style={{fontSize: 35}} value="+1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                scrollRef.current.scrollTo({x: (tempo + 5) * 10, y: 0, animated: true})
                
              }}>
              <Copy style={{fontSize: 25}} value="+5" />

            </TouchableOpacity>  

          </View>

          <Slider
            style={{width: 200, height: 40}}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="darkgray"
            onSlidingComplete={(v) => {
              sound.setVolume(v)
              dispatch(actions.setVolume(v))
            }}
          />

          <View style={{height: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>

            <ScrollView
              ref={scrollRef}
              style={{width: 100, flex: 1, height: 50, marginHorizontal: 20}}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{height: 40}}
              horizontal={true}
              scrollEventThrottle={16}
              onScroll={(ev) => {
                const bpm = Math.round (ev.nativeEvent.contentOffset.x / 10)
                if (bpm > 0 && bpm <= 400) {
                  dispatch(actions.saveTempo(bpm))
                }

                if ((bpm !== tempo) && (bpm > 0) && (bpm <= 400)) {
                  Haptics.selectionAsync()
                }

              }}
            >

              { ticks.map((item, idx)=>{
                return(
                  <View key={idx}
                        style={{backgroundColor: isDarkMode ? "white" : "black",
                                width: 5, height: 50, margin: 5}}></View>
                )
              })

              }

            </ScrollView>

          </View>

          <Dialog.Container visible={isPresetDialogVisible}>
            <Dialog.Title>Save preset</Dialog.Title>
            <Dialog.Description>
              Save this current settings as a new preset?
            </Dialog.Description>
            <Dialog.Input onChangeText={(v)=>setPresetName(v)} />
            <Dialog.Button label="Cancel" 
              onPress={() => {
                setPresetDialogVisible(false)
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
                setPresetDialogVisible(false)
              }}/>
          </Dialog.Container>
          
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


export default Metronome