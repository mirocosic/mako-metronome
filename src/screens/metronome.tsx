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
import { msToBpm } from '../utils/common'
import SaveDialog from '../components/save-dialog'
import Indicators from '../components/indicators'
import TempoControls from '../components/tempo-controls'
import VolumeControls from '../components/volume-controls'
import Controls from '../components/controls'
import MetronomeHeader from "../components/metronome-header"
import styles from './styles'

const Metronome = () => {
  const isDarkMode = useDarkTheme()
  const dispatch = useDispatch()

  const ticks = [...Array(300).keys()];

  const scrollRef = useRef()
  const inputRef = useRef()

  const tempo = useSelector((state) => state.tempo.value)
  const [isPlaying, togglePlaying] = useState(false)
  const [isPresetDialogVisible, setPresetDialogVisible] = useState(false)
  const indicators = useSelector(state => state.indicators)
  const [currentIndicatorIdx , setCurrentIndicatorIdx] = useState(0)

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
            tempo={tempo}
            indicators={indicators}
            setCurrentIndicatorIdx={setCurrentIndicatorIdx} />

          <TempoControls
            scrollRef={scrollRef}
            inputRef={inputRef} />

          <VolumeControls />

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