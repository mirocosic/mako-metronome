import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  KeyboardAvoidingView,
} from 'react-native'

import * as Haptics from 'expo-haptics'
import { useDarkTheme } from '../utils/ui-utils'
import { msToBpm, bpmToMs } from '../utils/common'
import SaveDialog from '../components/save-dialog'
import Indicators from '../components/indicators'
import TempoControls from '../components/tempo-controls'
import Controls from '../components/controls'
import MetronomeHeader from "../components/metronome-header"
import Slider from '@react-native-community/slider'
import { Audio } from 'expo-av'
import styles from './styles'

const Metronome = () => {
  const isDarkMode = useDarkTheme()
  const dispatch = useDispatch()

  const ticks = [...Array(300).keys()];

  const scrollRef = useRef()
  const inputRef = useRef()

  const tempo = useSelector((state) => state.tempo.value)
  const [isPlaying, togglePlaying] = useState(false)
  const isVibrateEnabled = useSelector(state => state.settings.vibrate)
  const isSoundEnabled = useSelector(state => state.settings.sound)
  const volume = useSelector(state => state.settings.volume)
  
  const [taps, setTaps] = useState([0])
  const [tapMessage, setTapMessage] = useState("")
  const [isPresetDialogVisible, setPresetDialogVisible] = useState(false)
  const indicators = useSelector(state => state.indicators)

  const [currentIndicatorIdx , setCurrentIndicatorIdx] = useState(0)

  // todo: maybe move to controls component
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
  
  const [sound, setSound] = React.useState();

  async function playExpoSound(isAccented) {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    
    const click = isAccented ? require('../../assets/click4.mp3') : require('../../assets/click3.mp3')
    const { sound } = await Audio.Sound.createAsync(click);
    setSound(sound)
    await sound.setVolumeAsync(volume)
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound])

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

      if(currentIndicatorIdx === indicators.length - 1) {
        currentIndicatorIdx = 0
        setCurrentIndicatorIdx(0)
      } else {
        currentIndicatorIdx = currentIndicatorIdx + 1
        setCurrentIndicatorIdx(currentIndicatorIdx)
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
      clearInterval(interval)
    }

  }, [tempo, isPlaying, isVibrateEnabled, isSoundEnabled, indicators, volume])


  // set initial scroll position to initial tempo
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current.scrollTo({x: tempo * 10, y: 0, animated: false})
    }, 0)
  }, [])

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior="padding"
        style={{paddingBottom: 50, flex: 1}}>

        <MetronomeHeader setPresetDialogVisible={setPresetDialogVisible}/>

        <View style={{flex: 1,alignItems: "center", justifyContent: "space-evenly"}}>

          <Indicators
            currentIndicatorIdx={currentIndicatorIdx}
            isPlaying={isPlaying} />

          <Controls
            togglePlaying={togglePlaying}
            isPlaying={isPlaying}
            getTapTempo={getTapTempo} 
            playExpoSound={playExpoSound} />

          <Text style={{color:"white"}}>{tapMessage}</Text>

          <TempoControls
            scrollRef={scrollRef}
            inputRef={inputRef} />

          <Slider
            style={{width: 200, height: 40}}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="darkgray"
            onSlidingComplete={ v => dispatch(actions.setVolume(v)) }/>

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
              }}>
              { ticks.map((item, idx)=>{
                return(
                  <View key={idx}
                        style={{backgroundColor: isDarkMode ? "lightgrey" : "black",
                                width: 5, height: 50, margin: 5}} />
                )
              })}
            </ScrollView>
          </View>

          <SaveDialog isPresetDialogVisible={isPresetDialogVisible} setPresetDialogVisible={setPresetDialogVisible}/>
          
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Metronome