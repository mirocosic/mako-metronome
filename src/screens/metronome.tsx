import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen'
import RNSound from "react-native-sound"
import * as Haptics from 'expo-haptics';

import Section from "../components/section"


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
    margin: 10}
});


var sound = new RNSound('click2.mp3', RNSound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error)
    return
  }
})

const bpmToMs = (bpm) => {
  return 1000 / (bpm / 60)
}

const msToBpm = (ms) => {
  return Math.round((1000 / ms ) * 60)
}



const Metronome = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const tempo = useSelector((state) => state.tempo.value)
  const dispatch = useDispatch()

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1
  };

  const ticks = [...Array(300).keys()];

  const scrollRef = useRef()
  const inputRef = useRef()

  const [input, setInput] = useState(100)
  const [isPlaying, togglePlaying] = useState(false)
  const isVibrateEnabled = useSelector(state => state.settings.vibrate)

  const [taps, setTaps] = useState([0])
  const [tapMessage, setTapMessage] = useState("")

  const indicators = useSelector(state => state.indicators)

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
      
      //maybe
      //scrollRef.current.scrollTo({x: msToBpm(diff) * 10, y: 0, animated: true})
    }
    


  }

  const playSound = () => {
    sound.play()

    // this produces uneven metronome on higher tempos
    // sound.stop(() => {
    //   sound.play()
    // })
  } 

  const showIndicator = (currentIndicatorIdx) => {

    if (!indicators[currentIndicatorIdx].active) { return }

    dispatch(actions.flashIndicator({
      idx: currentIndicatorIdx,
      indicating: true
    }))

    setTimeout(() => {
      dispatch(actions.flashIndicator({
        idx: currentIndicatorIdx,
        indicating: false
      }))

    }, 200);
  }
  
   useEffect(() => {

    let currentIndicatorIdx = 0

    if (isPlaying) {
      playSound()
      if (isVibrateEnabled) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      
      showIndicator(currentIndicatorIdx)

      if(currentIndicatorIdx === 3) {
        currentIndicatorIdx = 0
      } else {
        currentIndicatorIdx = currentIndicatorIdx + 1
      }
    }

    // run interval fn
    const interval = setInterval(() => {

      if (isPlaying) {
        playSound()
        if (isVibrateEnabled) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        showIndicator(currentIndicatorIdx)

        if(currentIndicatorIdx === 3) {
          currentIndicatorIdx = 0
        } else {
          currentIndicatorIdx = currentIndicatorIdx + 1
        }
      }

    }, bpmToMs(tempo))

    // cleanup interval fn
    return () => {
      clearInterval(interval)
    }

   }, [tempo, isPlaying, isVibrateEnabled])


  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <KeyboardAvoidingView
        behavior="padding"
        style={{paddingBottom: 50, flex: 1}}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-evenly",
          }}>
          <Section title="Mako Metronome">
            <View>
              <TouchableOpacity onPress={() => dispatch(actions.savePreset({name: "new preset", tempo: tempo, vibrate: isVibrateEnabled}))}>
                <Text style={{color: "white", textAlign: "center"}}>Save preset</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
                dispatch(actions.loadTempo(37)) // replace by lookup from state
                dispatch(actions.setVibrate(false)) // todo: load from preset
                //dispatch(actions.loadPreset({name: "new preset", tempo: tempo}))
              }}>
                <Text style={{color: "white", textAlign: "center"}}>Load preset 37</Text>
              </TouchableOpacity>

            </View>
            

          </Section>

          <View style={{flexDirection: "row"}}>
            {
              indicators.map((indicator, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.indicatorBox,
                            indicator.active && {backgroundColor: "lightgray"},
                            indicator.indicating && {backgroundColor: "teal"}]}
                    onPress={() => dispatch(actions.toggleIndicator({idx, active: !indicator.active}))} />
                )
              })
            }
          </View>

          <View style={{flexDirection: "row"}}>

            <TouchableOpacity onPress={() => togglePlaying(!isPlaying)}>
              <View style={{backgroundColor: "lightblue", padding: 20, borderRadius: 10, alignItems: "center", margin:10}}>
                <Text style={{color: "black", fontSize: 20}}>
                {isPlaying ? "Pause" : "Play"}
                </Text>
              </View>
              
            </TouchableOpacity> 

            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              getTapTempo()
              playSound()
              }}>
              <View style={{backgroundColor: "lightblue", padding: 20, borderRadius: 10, alignItems: "center", margin: 10}}>
                <Text style={{color: "black", fontSize: 20}}>
                Tap
                </Text>
              </View>
              
            </TouchableOpacity> 

            <TouchableOpacity onPress={() => dispatch(actions.setVibrate(!isVibrateEnabled))}>
              <View style={{backgroundColor: "lightblue", padding: 20, borderRadius: 10, alignItems: "center", margin:10}}>
                <Text style={{color: "black", fontSize: 20}}>
                {isVibrateEnabled ? "No vibrate" : "Vibrate"}
                </Text>
              </View>
            </TouchableOpacity> 

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
              <Text style={{color: "white", fontSize:25}}>-5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                scrollRef.current.scrollTo({x: (tempo - 1) * 10, y: 0, animated: true})
              }}>
              <Text style={{color: "white", fontSize:35}}>-1</Text>
            </TouchableOpacity>

            
            <TextInput
              ref={inputRef}
              value={ inputRef.current && inputRef.current.isFocused() ? String(input) : String(tempo)}
              style={{color: "white", fontSize: 40, padding: 10, borderWidth: 1, borderColor: "gray", borderRadius: 10, width: 100, height: 60, alignItems:"center", justifyContent: "center", textAlign: "center"}}
              keyboardType="number-pad"
              returnKeyType={ 'done' }
              onFocus={() => setInput("")}
              onChangeText={(v) => {
                console.log(v)
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
              <Text style={{color: "white", fontSize:35}}>+1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                scrollRef.current.scrollTo({x: (tempo + 5) * 10, y: 0, animated: true})
                
              }}>
              <Text style={{color: "white", fontSize: 25}}>+5</Text>
            </TouchableOpacity>  

          </View>

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
                  <View key={idx} style={{backgroundColor: "white", width: 5, height: 50, margin: 5}}></View>
                )
              })

              }

            </ScrollView>

          </View>
          
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


export default Metronome