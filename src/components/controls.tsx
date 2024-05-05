import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { SafeAreaView, View, TouchableOpacity, StyleSheet, Text, TextInput, NativeModules, Button, Platform } from 'react-native'
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

import { ScrollView, Switch } from "react-native-gesture-handler"
import { VolumeManager } from 'react-native-volume-manager';
import RTNSoundmodule from 'rtn-soundmodule/js/NativeSoundmodule'

import RTNMetronomeModule from "rtn-metronome-module/src/NativeRTNMetronomeModule"

RTNMetronomeModule.multiply(3, 7, (result) => {
  console.log('3 * 7 = ', result);
})

const BpmButton = ({ selected, btnIdx, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.bpmButton, selected && styles.bpmButtonSelected]}
      onPress={onPress}>
      <Text style={[styles.bpmButtonText, selected && {color: "white"}]}>{"+" + btnIdx + " bpm"}</Text>
    </TouchableOpacity>
  );
};

const TempoChanger = () => {
  const tempoChanger = useSelector(state => state.settings.tempoChanger)
  const tempoChangerBpms = useSelector(state => state.settings.tempoChangerBpms)
  const tempoChangerBars = useSelector(state => state.settings.tempoChangerBars)
  const [tempoChangerValue, setTempoChangerValue] = useState(tempoChanger)
  const tempoChangerBarsScrollViewRef = useRef(null)
  const tempoChangerBpmsScrollViewRef = useRef(null)
  const dispatch = useDispatch()

  return (
    <View style={{marginBottom: 20, flex: 1}}>

      <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 40, paddingHorizontal:15}}>
        <Copy value="Tempo changer" style={{fontSize: 18, color: palette.teal}} />
        <Switch
          onValueChange={() => {
            setTempoChangerValue(!tempoChangerValue)
            dispatch(actions.toggleTempoChanger(!tempoChanger))
          }}
          value={tempoChangerValue}
          trackColor={{false: palette.teal, true: palette.teal}}/>
      </View>


      <View style={{flex: 1, padding: 10, paddingHorizontal: 0}}>
              <View style={{padding:5}}>
                <Copy value="Change tempo by" style={{paddingHorizontal: 10}}/>
                <ScrollView
                  ref={tempoChangerBpmsScrollViewRef}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false} 
                  horizontal={true}
                  contentContainerStyle={{paddingHorizontal: 10}}
                  onLayout={()=> {
                    tempoChangerBpmsScrollViewRef.current.scrollTo({x: (tempoChangerBpms - 1) * 70, y: 0, animated: false})
                  }}
                  >
                  { [...Array(10).keys()].map((i) => {
                    const btnIdx = i + 1
                    return (
                      <BpmButton
                        key={i} 
                        btnIdx={btnIdx} 
                        selected={tempoChangerBpms === btnIdx}
                        onPress={() => dispatch(actions.setTempoChangerBpms(btnIdx))}
                        />
                    )})}
                  
                </ScrollView>
              </View>

              <View style={{padding: 5, paddingTop: 10}}>
                <Copy value="Every " style={{paddingHorizontal: 10}}/>
                <ScrollView
                  ref={tempoChangerBarsScrollViewRef}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                  contentContainerStyle={{paddingHorizontal: 10}}
                  onLayout={()=> {
                    tempoChangerBarsScrollViewRef.current.scrollTo({x: (tempoChangerBars - 1) * 65, y: 0, animated: false})
                  }}
                  >
                  { [...Array(16).keys()].map((i) => {
                    const btnIdx = i + 1
                    return (
                      <BarButton 
                        key={i} 
                        btnIdx={btnIdx} 
                        selected={tempoChangerBars === btnIdx} 
                        onPress={()=>dispatch(actions.setTempoChangerBars(btnIdx))}
                        />
                    )})}
                  
                </ScrollView>
              </View>
          </View>
      
    </View>
  )
}

const BarButton = ({ selected, btnIdx, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.barButton, selected && styles.barButtonSelected]}
      onPress={onPress}>
      <Text style={[styles.barButtonText, selected && {color: "white"}]}>{btnIdx === 1 ? "1 bar" : btnIdx + " bars"}</Text>
    </TouchableOpacity>
  );
};

const TimeSignatureButton = ({ title, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.timeSigButton, selected && styles.barButtonSelected]}
      onPress={onPress}>
      <Text style={[styles.barButtonText, selected && {color: "white"}]}>
        {title}
        </Text>
    </TouchableOpacity>
  );
};


const GapTrainer = ({gapBarsNormal, gapBarsMuted, gapTrainer}) => {
  const dispatch = useDispatch()
  const mutedBarsScrollViewRef = useRef(null)
  const normalBarsScrollViewRef = useRef(null)
  const [switchValue, setSwitchValue] = useState(gapTrainer)

  return (
    <SafeAreaView style={{flex: 1,  marginBottom: 20, padding: 0}}>

          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 40, paddingHorizontal:15}}>
            <Copy value="Gap trainer" style={{fontSize: 18, color: palette.teal}} />
            <Switch
              onValueChange={() => {
                setSwitchValue(!switchValue)
                dispatch(actions.toggleGapTrainer(!gapTrainer))
              }}
              value={switchValue}
              trackColor={{false: palette.teal, true: palette.teal}}
              />
          </View>
          

          <View style={{flex: 1, padding: 10, paddingHorizontal: 0}}>
              <View style={{padding:5}}>
                <Copy value="Normal bars" style={{paddingHorizontal: 10}}/>
                <ScrollView
                  ref={normalBarsScrollViewRef}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false} 
                  horizontal={true}
                  contentContainerStyle={{paddingHorizontal: 10}}
                  onLayout={()=> {
                    normalBarsScrollViewRef.current.scrollTo({x: (gapBarsNormal - 1) * 65, y: 0, animated: false})
                  }}
                  >
                  { [...Array(16).keys()].map((i) => {
                    const btnIdx = i + 1
                    return (
                      <BarButton key={i} btnIdx={btnIdx} selected={gapBarsNormal === btnIdx} onPress={()=>dispatch(actions.setGapBarsNormal(btnIdx))}/>
                    )})}
                  
                </ScrollView>
              </View>

              <View style={{padding: 5, paddingTop: 10}}>
                <Copy value="Muted bars" style={{paddingHorizontal: 10}}/>
                <ScrollView
                  ref={mutedBarsScrollViewRef}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                  contentContainerStyle={{paddingHorizontal: 10}}
                  onLayout={()=> {
                    mutedBarsScrollViewRef.current.scrollTo({x: (gapBarsMuted - 1) * 65, y: 0, animated: false})
                  }}
                  >
                  { [...Array(16).keys()].map((i) => {
                    const btnIdx = i + 1
                    return (
                      <BarButton key={i} btnIdx={btnIdx} selected={gapBarsMuted === btnIdx} onPress={()=>dispatch(actions.setGapBarsMuted(btnIdx))}/>
                    )})}
                  
                </ScrollView>
              </View>
          </View>
          
          
        </SafeAreaView>
  )
}

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
  const gapTrainer = useSelector(state => state.settings.gapTrainer)
  const gapTrainerRef = useRef(gapTrainer)
  const gapBarsNormal = useSelector(state => state.settings.gapBarsNormal)
  const gapBarsMuted = useSelector(state => state.settings.gapBarsMuted)
  const gapBarsNormalRef = useRef(gapBarsNormal)
  const gapBarsMutedRef = useRef(gapBarsMuted)

  const tempoChanger = useSelector(state => state.settings.tempoChanger)
  const tempoChangerRef = useRef(tempoChanger)
  const tempoChangerBpms = useSelector(state => state.settings.tempoChangerBpms)
  const tempoChangerBpmsRef = useRef(tempoChangerBpms)
  const tempoChangerBars = useSelector(state => state.settings.tempoChangerBars)
  const tempoChangerBarsRef = useRef(tempoChangerBars)

  const subdivisions = useSelector(state => state.settings.subdivisions)
  const subdivisionsRef = useRef(subdivisions)


  const [taps, setTaps] = useState([0])
  const [tapMessage, setTapMessage] = useState("")
  const [volumeIndicator, setVolumeIndicator] = useState(volume)
  const theme = useSelector(state => state.settings.theme)

  const startTimeRef = useRef(null)
  const barCounterRef = useRef(1)
  const tempoChangerBarCounterRef = useRef(1)

  const isPlayingRef = useRef(false)

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
        tintColor: palette.teal,
        textStyle: {color: palette.teal},
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
  const gapTrainerModalRef = useRef<BottomSheetModal>(null)
  const tempoChangerModalRef = useRef<BottomSheetModal>(null)
  const timeSignatureModalRef = useRef<BottomSheetModal>(null)

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

  const loop = useCallback(() => {
    togglePlaying(true)
    isPlayingRef.current = true

    let currentIndicatorIdx = 0
    let currentSubdivisionIdx = 0
    startTimeRef.current = new Date().getTime()

    const totalGapBars = gapBarsNormalRef.current + gapBarsMutedRef.current


    //trigger first indicator
    toggleIndicator(currentIndicatorIdx)

    let indicatorLevel0Active = indicatorsRef.current[currentIndicatorIdx].levels[0].active
    let indicatorLevel1Active = indicatorsRef.current[currentIndicatorIdx].levels[1].active

    const voice = indicatorLevel1Active ? voiceRef.current + "1" : voiceRef.current

    // first sound
    if (soundEnabledRef.current && indicatorLevel0Active) {
        RTNSoundmodule?.playSound(voice, false)
      
    }

    //currentIndicatorIdx = currentIndicatorIdx + 1 // increment indicator after first sound
    currentSubdivisionIdx = currentSubdivisionIdx + 1 // increment subdivision after first sound

    // and then the rest
    //let startTime = new Date().getTime();
    //let startTime = performance.now();

    const timer = () => {

      let startTime = performance.now();

      if (currentSubdivisionIdx === 0) {
          toggleIndicator(currentIndicatorIdx)
      }
        
        let indicatorLevel0Active = indicatorsRef.current[currentIndicatorIdx].levels[0].active
        let indicatorLevel1Active = indicatorsRef.current[currentIndicatorIdx].levels[1].active

        const voice = indicatorLevel1Active ? voiceRef.current + "1" : voiceRef.current

        //gapTrainer
        const totalGapBars = gapBarsNormalRef.current + gapBarsMutedRef.current
        const mutedBarNum = barCounterRef.current - gapBarsNormalRef.current
        const gapTrainerMute = gapTrainerRef.current && mutedBarNum > 0

        if (soundEnabledRef.current && indicatorLevel0Active && !gapTrainerMute) {
          if (currentSubdivisionIdx === 0) {
            RTNSoundmodule?.playSound(voice, false)
          } else if (subdivisionsRef.current[currentSubdivisionIdx]) {
            RTNSoundmodule?.playSound("click", false)
          }
        }
        
        currentSubdivisionIdx = currentSubdivisionIdx + 1 // increment subdivision after sound



        if (currentSubdivisionIdx >= subdivisionsRef.current.length) {
          currentSubdivisionIdx = 0 // reset subdivision

          if ((currentIndicatorIdx + 1) === indicatorsRef.current.length) {
            currentIndicatorIdx = 0 // reset indicator

            barCounterRef.current = barCounterRef.current + 1 // increment bar counter
            if (barCounterRef.current > totalGapBars) {
                barCounterRef.current = 1 // reset bar counter
            }

            //tempoChanger
            if (tempoChangerRef.current && tempoChangerBarCounterRef.current % tempoChangerBarsRef.current === 0) {
              dispatch(actions.saveTempo(tempoRef.current + tempoChangerBpmsRef.current))
            }

            tempoChangerBarCounterRef.current = tempoChangerBarCounterRef.current + 1 // increment tempoChanger bar counter

          } else {
            currentIndicatorIdx = currentIndicatorIdx + 1 // increment indicator after sound
          }

        }


      //console.log("time: ", (performance.now() - startTime) * 1000)


      if (isPlayingRef.current) {
        setTimeout(timer, (bpmToMs(tempoRef.current) / subdivisionsRef.current.length))
      }
    }

    setTimeout(timer, (bpmToMs(tempoRef.current) / subdivisionsRef.current.length))


  }, [tempo])

  const stopLoop = useCallback(() => {
    togglePlaying(false)

    isPlayingRef.current = false

    const timeElapsed = new Date().getTime() - startTimeRef.current
    dispatch(actions.saveTimeUsage(timeElapsed))
    barCounterRef.current = 1
    tempoChangerBarCounterRef.current = 1
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
    gapTrainerRef.current = gapTrainer
    gapBarsMutedRef.current = gapBarsMuted
    gapBarsNormalRef.current = gapBarsNormal
    tempoChangerRef.current = tempoChanger
    tempoChangerBpmsRef.current = tempoChangerBpms
    tempoChangerBarsRef.current = tempoChangerBars
    subdivisionsRef.current = subdivisions
  }, [tempo, isSoundEnabled, indicators, voice, gapTrainer, gapBarsMuted, gapBarsNormal, tempoChanger, tempoChangerBpms, tempoChangerBars, subdivisions])

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
          onPress={() => timeSignatureModalRef.current.present()}>
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 14 }}>
              <Fontisto name="heartbeat-alt" size={24} color="lightgray" />
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

        <TouchableOpacity onPress={() => {
          if (!isPlaying) 
            {loop()} 
            else 
            { stopLoop()}}}>
          <View style={[styles.buttonLarge, isPlaying && {backgroundColor: "lightgray"}]}>
            <Text style={{ color: 'black', fontSize: 20 }}>
              {isPlaying ? (
                <Ionicons name="pause" size={24} color={palette.teal} />
              ) : (
                <Text style={{color: "lightgray", fontWeight: "bold"}}>GO!</Text>
                // <Ionicons name="play" size={24} color="lightgray" />
              )}
            </Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={() => openPresetsMenu()}
          >
          <View style={styles.buttonSmall}>
            <Text style={{ color: 'black', fontSize: 4 }}>
              <MaterialCommunityIcons name="content-save-outline" size={24} color="lightgray" />
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => gapTrainerModalRef.current.present()}>
          <View style={[styles.buttonSmall, gapTrainer && {backgroundColor: "lightgray"}]}>
            <Text style={{ color: 'black', fontSize: 4 }}>
              <MaterialCommunityIcons name="transit-skip" size={24} color={gapTrainer ? "teal" : "lightgray"} />
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => tempoChangerModalRef.current.present()}>
          <View style={[styles.buttonSmall, 
                        {transform: [{ scaleX: -1 }]},
                        tempoChanger && {backgroundColor: "lightgray"}]}>
            <Text style={{ color: 'black', fontSize: 4 }}>
              <MaterialCommunityIcons name="history" size={24} color={tempoChanger ? "teal" : "lightgray"} />
            </Text>
          </View>
        </TouchableOpacity>

      </View>

      <Text style={{color:"black", textAlign: "center"}}>{tapMessage}</Text>
      <View>
        {(currentPreset.name !== '' && typeof currentPreset.name !== "undefined"  ) ? (
          <Copy style={{textAlign: "center", color: isDarkMode ? "lightgray" : "gray"}} value={`Preset: ${currentPreset.name}`} />
        ) : null}
      </View>

      <Button 
        title="Start"
        color={palette.teal} 
        onPress={() => {
          console.log("bpms: ")
          console.log(bpmToMs(tempoRef.current))
          RTNMetronomeModule.start(bpmToMs(tempoRef.current), () => console.log("Callback from native"))}}>
      </Button>

      <Button 
        title="Stop"
        onPress={() => {
          stopLoop()
          RTNMetronomeModule.stop()}}
        color={palette.teal}>
      </Button>

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
              thumbTintColor={palette.teal}
              minimumTrackTintColor={palette.teal}
              maximumTrackTintColor="darkgray"
              onValueChange={(v) => setVolumeIndicator(v)}
              onSlidingComplete={ async (v) => {
                await VolumeManager.setVolume(v)
                dispatch(actions.setVolume(v)) 
                }}/>
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
        handleIndicatorStyle={{backgroundColor: isDarkMode ? palette.teal : "black"}}
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
            <Button color={palette.teal} title="Save"
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

      <BottomSheetModal
        ref={tempoChangerModalRef}
        index={0}
        enablePanDownToClose={true}
        snapPoints={[250]}
        backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
        handleIndicatorStyle={{backgroundColor: isDarkMode ? "black" : "black"}}
        backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "#f1f1f1"}}>

        <TempoChanger />
        
      </BottomSheetModal>

      <BottomSheetModal
        ref={gapTrainerModalRef}
        index={0}
        enablePanDownToClose={true}
        snapPoints={[250]}
        backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
        handleIndicatorStyle={{backgroundColor: isDarkMode ? "black" : "black"}}
        backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "#f1f1f1"}}>

        <GapTrainer gapBarsNormal={gapBarsNormal} gapBarsMuted={gapBarsMuted} gapTrainer={gapTrainer} />
        
      </BottomSheetModal>


      <BottomSheetModal
        ref={timeSignatureModalRef}
        index={0}
        enablePanDownToClose={true}
        snapPoints={[250]}
        backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
        handleIndicatorStyle={{backgroundColor: isDarkMode ? "white" : "black"}}
        backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "white"}}>

        <View>
          <Copy value="Time signature" style={{color: palette.teal, fontSize: 18, padding: 10}} />

        </View>

        <ScrollView contentContainerStyle={{paddingBottom: 10}} horizontal={true}>
          <Button title="1/4" color="lightgray" onPress={() => dispatch(actions.setIndicators(1))} />
          <Button title="2/4" color="lightgray" onPress={() => dispatch(actions.setIndicators(2))} />
          <Button title="3/4" color="lightgray" onPress={() => dispatch(actions.setIndicators(3))} />
          <Button title="4/4" color="lightgray" onPress={() => dispatch(actions.setIndicators(4))} />
          <Button title="5/4" color="lightgray" onPress={() => dispatch(actions.setIndicators(5))} />
          <Button title="6/4" color="lightgray" onPress={() => dispatch(actions.setIndicators(6))} />
          <Button title="7/4" color="lightgray" onPress={() => dispatch(actions.setIndicators(7))} />
          <Button title="8/4" color="lightgray" onPress={() => dispatch(actions.setIndicators(8))} />
        </ScrollView>

        <Copy value="Subdivisons" style={{color: palette.teal, fontSize: 18, padding: 10}} />
        <ScrollView contentContainerStyle={{paddingBottom: 10}} horizontal={true}>
          <TimeSignatureButton 
            title="♩"
            selected={subdivisions.toString() === [true, false, false, false].toString()}
            onPress={() => dispatch(actions.setSubdivisions([true, false, false, false]))}/>

          <TimeSignatureButton 
            title="♫"
            selected={subdivisions.toString() === [true, false, true, false].toString()}
            onPress={() => dispatch(actions.setSubdivisions([true, false, true, false]))}/>
            
          <TimeSignatureButton 
            title="♬♬"
            selected={subdivisions.toString() === [true, true, true, true].toString()}
            onPress={() => dispatch(actions.setSubdivisions([true, true, true, true]))}/>

          <TimeSignatureButton 
            title="♩♩♩"
            selected={subdivisions.toString() === [true, true, true].toString()}
            onPress={() => dispatch(actions.setSubdivisions([true, true, true]))}/>
        </ScrollView>

      </BottomSheetModal>

    </View>
  )
}

const styles = StyleSheet.create({
  buttonLarge: {
    backgroundColor: palette.teal,
    width: 60,
    height: 60,
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5
  },

  buttonSmall: {
      backgroundColor: palette.teal,
      width: 40,
      height: 40,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 5
  },
  barButton: {
    //paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 4,
    width: 65,
  },
  barButtonSelected: {
    backgroundColor: palette.teal,
  },
  barButtonText: {
    color: 'gray',
    fontSize: 16,
    //fontWeight: 'bold',
    textAlign: 'center',
  },

  bpmButton: {
    //paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 4,
    width: 70,
  },
  bpmButtonSelected: {
    backgroundColor: palette.teal,
  },
  bpmButtonText: {
    color: 'gray',
    fontSize: 16,
    //fontWeight: 'bold',
    textAlign: 'center',
  },

  timeSigButton: {
    height: 30,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 4,
    width: 65,
  }

})

export default connectActionSheet(Controls)
