/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
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

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Slider from '@react-native-community/slider';

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

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [tempo, setTempo] = useState(100)
  const [isPlaying, togglePlaying] = useState(false)
  const [showDot, setShowDot] = useState(true)

  useEffect(() => {
    const interval = setInterval( () => {
      setShowDot(true)
        setTimeout(()=>{
          setShowDot(false)
        }, 100)
    }, tempo)

    return () => {
      clearInterval(interval)
    }

  }, [tempo])

  // useEffect(() => {
  //   console.log("effect trigg")

  //   if (isPlaying) {
  //     setInterval(() => {
        
  //     }, 500)
  //   } else {

  //   }
  // }, [isPlaying])

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            alignItems: "center",
          }}>
          <Section title="Mako Metronome"></Section>

          <Section title="Tempo">
            { tempo }
          </Section>

          <Slider
              style={{width: 300, height: 20}}
              minimumValue={20}
              maximumValue={1000}
              step={1}
              onValueChange={(v) => setTempo(v)}
              value={tempo}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#333333"
            />

          <Section title="">
            <TouchableOpacity onPress={() => togglePlaying(!isPlaying)}>
              <View>
                <Text style={{color: "white"}}>
                  Play / Pause
                </Text>
              </View>
              
            </TouchableOpacity> 

          </Section>

          <Section title={isPlaying ? "Playing" : "Paused"}></Section>

          <Section title="">
            {showDot && isPlaying && 
            <View style={{width: 100, height: 100, backgroundColor: "yellow", borderRadius: 100}}></View>
            }
            
          </Section>
          
        </View>
      </ScrollView>
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
