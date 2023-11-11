import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'
import { BottomSheetModal,  BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated'

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  KeyboardAvoidingView,
  Button
} from 'react-native'

import * as Haptics from 'expo-haptics'
import { useDarkTheme } from '../utils/ui-utils'
import { msToBpm } from '../utils/common'
import SaveDialog from '../components/save-dialog'
import Indicators from '../components/indicators'
import TempoControls from '../components/tempo-controls'
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

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const sharedValues = useSharedValue(Array(indicators.length).fill(0))

  useEffect(() => {
    sharedValues.value = Array(indicators.length).fill(0)
  }, [indicators])

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
        style={{paddingBottom: 50, paddingTop: 50, flex: 1}}>

        {/* <MetronomeHeader setPresetDialogVisible={setPresetDialogVisible}/> */}

        <View style={{flex: 1, alignItems: "center", justifyContent: "flex-end"}}>

          <Indicators
            currentIndicatorIdx={currentIndicatorIdx}
            isPlaying={isPlaying}
            sharedValues={sharedValues}
          />

          <View style={{ marginVertical: 50, flex: 1, justifyContent: "flex-end", alignItems: "center"}}>

            <TempoControls scrollRef={scrollRef} inputRef={inputRef} />

            <View style={{height: 60}}>
            <ScrollView
              ref={scrollRef}
              style={{marginHorizontal: 0, height: 0}}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(ev) => {
                const bpm = Math.round(ev.nativeEvent.contentOffset.x / 10)
                if (bpm > 0 && bpm <= 400) {
                  dispatch(actions.saveTempo(bpm))
                }

                if ((bpm !== tempo) && (bpm > 0) && (bpm <= 400)) {
                  Haptics.selectionAsync()
                }
              }}
              onScrollEndDrag={(ev) => {
                const bpm = Math.round(ev.nativeEvent.contentOffset.x / 10)
                if (bpm > 0 && bpm <= 400) {
                  dispatch(actions.saveTempo(bpm))
                }

                if ((bpm !== tempo) && (bpm > 0) && (bpm <= 400)) {
                  Haptics.selectionAsync()
                }
              }}
              onScroll={(ev) => {
                const bpm = Math.round(ev.nativeEvent.contentOffset.x / 10)
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
                        style={{backgroundColor: isDarkMode ? "grey" : "grey",
                                width: 5, height: 50, margin: 5}} />
                )
              })}
            </ScrollView>
            </View>
            
          </View>

          <Controls
            togglePlaying={togglePlaying}
            isPlaying={isPlaying}
            tempo={tempo}
            indicators={indicators}
            setCurrentIndicatorIdx={setCurrentIndicatorIdx}
            sharedValues={sharedValues}
            bottomSheetModalRef={bottomSheetModalRef}
            setPresetDialogVisible={setPresetDialogVisible}
          />

          <SaveDialog isPresetDialogVisible={isPresetDialogVisible} setPresetDialogVisible={setPresetDialogVisible}/>
          
          
          <BottomSheetModal
              ref={bottomSheetModalRef}
              index={0}
              enablePanDownToClose={true}
              snapPoints={[250]}
              backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
              handleIndicatorStyle={{backgroundColor: isDarkMode ? "white" : "black"}}
              backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "white"}}
            >
              <ScrollView contentContainerStyle={{paddingBottom: 40}}>
                <Button title="1 Beat" color="teal" onPress={() => dispatch(actions.setIndicators(1))} />
                <Button title="2 Beats" color="teal" onPress={() => dispatch(actions.setIndicators(2))} />
                <Button title="3 Beats" color="teal" onPress={() => dispatch(actions.setIndicators(3))} />
                <Button title="4 Beats" color="teal" onPress={() => dispatch(actions.setIndicators(4))} />
                <Button title="5 Beats" color="teal"  onPress={() => dispatch(actions.setIndicators(5))} />
                <Button title="6 Beats" color="teal" onPress={() => dispatch(actions.setIndicators(6))} />
                <Button title="7 Beats" color="teal" onPress={() => dispatch(actions.setIndicators(7))} />
                <Button title="8 Beats" color="teal" onPress={() => dispatch(actions.setIndicators(8))} />
                {/* <Button title="9 Beats" onPress={() => dispatch(actions.setIndicators(9))} />
                <Button title="10 Beats" onPress={() => dispatch(actions.setIndicators(10))} />
                <Button title="11 Beats" onPress={() => dispatch(actions.setIndicators(11))} />
                <Button title="12 Beats" onPress={() => dispatch(actions.setIndicators(12))} />
                <Button title="13 Beats" onPress={() => dispatch(actions.setIndicators(13))} />
                <Button title="14 Beats" onPress={() => dispatch(actions.setIndicators(14))} />
                <Button title="15 Beats" onPress={() => dispatch(actions.setIndicators(15))} />
                <Button title="16 Beats" onPress={() => dispatch(actions.setIndicators(16))} /> */}

                
                
              </ScrollView>
            </BottomSheetModal>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Metronome