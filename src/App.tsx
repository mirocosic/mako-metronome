
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
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen'
import Slider from '@react-native-community/slider'
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

  const [tempo, setTempo] = useState(100)
  const [isPlaying, togglePlaying] = useState(false)
  const [showDot, setShowDot] = useState(true)

  const [lastTap, setLastTap] = useState(0)

  const getTapTempo = () => {

    if (lastTap === 0) {
      setLastTap(Date.now())
      return;
    } else {
      const diff = Date.now() - lastTap
      console.log("ms diff: ", diff)
      console.log("bpm diff:", msToBpm(diff))
      setLastTap(Date.now())
      setTempo(msToBpm(diff))
    }
    


  }

  const playSound = () => {
    sound.play()

    // this produces uneven metronome on higher tempos

    // sound.stop(() => {
    //   sound.play()
    // })
  }
  
   useEffect(() => {

    if (isPlaying) { playSound() }

    // run interval fn
    const interval = setInterval(() => {
      if (isPlaying) { playSound() }
    }, bpmToMs(tempo))

    // cleanup interval fn
    return () => {
      clearInterval(interval)
    }

   }, [tempo, isPlaying])

   console.log("tempo: " , tempo)

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <View
        style={{paddingBottom: 50, flex: 1}}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-evenly",
          }}>
          <Section title="Mako Metronome"></Section>

          <View style={{flexDirection: "row"}}>

            <TouchableOpacity onPress={() => togglePlaying(!isPlaying)}>
              <View style={{backgroundColor: "lightblue", padding: 20, borderRadius: 10, alignItems: "center", margin:10}}>
                <Text style={{color: "black", fontSize: 20}}>
                {isPlaying ? "Pause" : "Play"}
                </Text>
              </View>
              
            </TouchableOpacity> 

            <TouchableOpacity onPress={() => {
              getTapTempo()
              playSound()
              }}>
              <View style={{backgroundColor: "lightblue", padding: 20, borderRadius: 10, alignItems: "center", margin: 10}}>
                <Text style={{color: "black", fontSize: 20}}>
                Tap
                </Text>
              </View>
              
            </TouchableOpacity> 

          </View>

          <Section title="">
            

          </Section>

          <View>
            <Section title={`Tempo - ${ tempo } bpm `}></Section>
  
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

          <View style={{height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>

          <TouchableOpacity
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
            </TouchableOpacity>

            <ScrollView
              ref={scrollRef}
              style={{width: 100, flex: 1, backgroundColor: "black", height: 30}}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{height: 30}}
              horizontal={true}
              scrollEventThrottle={16}
              onScroll={(ev) => {
                console.log(ev.nativeEvent.contentOffset)
                const bpm = Math.round (ev.nativeEvent.contentOffset.x / 10)
                console.log(bpm)
                if (bpm > 0 && bpm <= 400) {
                  setTempo(bpm)
                }
              }}
            >

              { ticks.map((item, idx)=>{
                return(
                  <View key={idx} style={{backgroundColor: "white", width: 5, height: 30, margin: 5}}></View>
                )
              })

              }

            </ScrollView>

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
              <Text style={{color: "white", fontSize:35}}>+5</Text>
            </TouchableOpacity>

          </View>

          

          

          {/* <Section title="">
            {showDot && isPlaying && 
              <View style={{width: 100, height: 100, backgroundColor: "yellow", borderRadius: 100}}></View>
            }
            
          </Section> */}
          
        </View>
      </View>
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
});

export default App;
