
import React, { useState, useEffect, useRef } from 'react';
import type {PropsWithChildren} from 'react';
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

import * as Haptics from 'expo-haptics';

import { Colors } from 'react-native/Libraries/NewAppScreen'
import RNSound from "react-native-sound"

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

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

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1
  };

  const ticks = [...Array(300).keys()];

  const scrollRef = useRef()
  const inputRef = useRef()

  const [tempo, setTempo] = useState(100)
  const [input, setInput] = useState(100)
  const [isPlaying, togglePlaying] = useState(false)
  const [isVibrateEnabled, setIsVibrateEnabled] = useState(false)
  const [showDot, setShowDot] = useState(true)

  const [taps, setTaps] = useState([0])
  const [tapMessage, setTapMessage] = useState("")

  // todo, rename these, probably something to do with time signatures, accents, etc...
  const [indicators, setIndicators] = useState({first: {active: true, indicating: false},
                                                second: {active: true, indicating: false},
                                                third: {active: true, indicating: false},
                                                fourth: {active: false, indicating: false}})

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
        setTempo(msToBpm(avgTaps))
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

  const showIndicator = (currentIndicator) => {

    setIndicators({
      first: {
        ...indicators.first,
        indicating: currentIndicator === 1 && indicators.first.active
      },
      second: {
        ...indicators.second,
        indicating: currentIndicator === 2 && indicators.second.active
      },
      third: {
        ...indicators.third,
        indicating: currentIndicator === 3 && indicators.third.active
      }, 
      fourth: {
        ...indicators.fourth,
        indicating: currentIndicator === 4 && indicators.fourth.active
      },
    })
    setTimeout(() => {
      setIndicators({
      first: {
        ...indicators.first,
        indicating: false
      },
      second: {
        ...indicators.second,
        indicating: false
      },
      third: {
        ...indicators.third,
        indicating: false
      }, 
      fourth: {
        ...indicators.fourth,
        indicating: false
      },
    })
    }, 200)

  }
  
   useEffect(() => {

    let currentIndicator = 1

    if (isPlaying) {
      playSound()
      if (isVibrateEnabled) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      
      showIndicator(currentIndicator)

      if(currentIndicator === 4) {
        currentIndicator = 1
      } else {
        currentIndicator = currentIndicator + 1
      }
    }

    // run interval fn
    const interval = setInterval(() => {

      if (isPlaying) {
        playSound()
        if (isVibrateEnabled) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        showIndicator(currentIndicator)

        if(currentIndicator === 4) {
          currentIndicator = 1
        } else {
          currentIndicator = currentIndicator + 1
        }
      }

    }, bpmToMs(tempo))

    // cleanup interval fn
    return () => {
      clearInterval(interval)
    }

   }, [tempo, isPlaying, isVibrateEnabled])

   console.log("tempo: " , tempo)

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
          <Section title="Mako Metronome"></Section>

          <View style={{flexDirection: "row"}}>
            <TouchableOpacity
              style={[styles.indicatorBox,
                      indicators.first.active && {backgroundColor: "lightgray"},
                      indicators.first.indicating && {backgroundColor: "teal"}]}
              onPress={() => setIndicators({...indicators, first: {...indicators.first, active: !indicators.first.active}})} />

            <TouchableOpacity
              style={[styles.indicatorBox,
                      indicators.second.active && {backgroundColor: "lightgray"},
                      indicators.second.indicating && {backgroundColor: "teal"}]}
              onPress={() => setIndicators({...indicators, second: {...indicators.second, active: !indicators.second.active}})} />
            
            <TouchableOpacity
              style={[styles.indicatorBox,
                      indicators.third.active && {backgroundColor: "lightgray"},
                      indicators.third.indicating && {backgroundColor: "teal"}]}
              onPress={() => setIndicators({...indicators, third: {...indicators.third, active: !indicators.third.active}})} />

            <TouchableOpacity
              style={[styles.indicatorBox,
                      indicators.fourth.active && {backgroundColor: "lightgray"},
                      indicators.fourth.indicating && {backgroundColor: "teal"}]}
              onPress={() => setIndicators({...indicators, fourth: {...indicators.fourth, active: !indicators.fourth.active}})} />
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

            <TouchableOpacity onPress={() => setIsVibrateEnabled(!isVibrateEnabled)}>
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

          {/* <Section title="">
            

          </Section> */}

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
                  setTempo(Number(input))
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
            

            {/* <Text style={{color: "white", fontSize: 40}}>{tempo}</Text> */}
  
            {/* <Slider
                style={{width: 300, height: 20}}
                minimumValue={10}
                maximumValue={300}
                step={1}
                onValueChange={(v) => {
                  scrollRef.current.scrollTo({x: v * 10, y: 0, animated: true})
                  setTempo(v)
                }}
                value={tempo}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#333333"
              /> */}

          </View>

          <View style={{height: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>

            {/* <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                scrollRef.current.scrollTo({x: (tempo - 5) * 10, y: 0, animated: true})
                
              }}>
              <Text style={{color: "white", fontSize:35}}>-5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                scrollRef.current.scrollTo({x: (tempo - 1) * 10, y: 0, animated: true})
              }}>
              <Text style={{color: "white", fontSize:35}}>-1</Text>
            </TouchableOpacity> */}

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
                  setTempo(bpm)
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

            {/* <TouchableOpacity
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
              <Text style={{color: "white", fontSize:35}}>+5</Text>
            </TouchableOpacity> */}

          </View>

          

          

          {/* <Section title="">
            {showDot && isPlaying && 
              <View style={{width: 100, height: 100, backgroundColor: "yellow", borderRadius: 100}}></View>
            }
            
          </Section> */}
          
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    // backgroundColor: "teal", 
    borderColor: "lightgray", 
    borderWidth: 1,
    margin: 10}
});

export default App;
