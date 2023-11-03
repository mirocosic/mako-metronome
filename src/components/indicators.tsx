
import React from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { useSelector, useDispatch } from 'react-redux'
import Indicator from "./indicator"

const Indicators = ({currentIndicatorIdx, isPlaying, sharedValues}) => {
  const indicators = useSelector(state => state.indicators)
  console.log("rendering indicators")
  return (
    <View style={{flexDirection: "row"}}>
            {
              indicators.map((indicator, idx: number) => {
                return (
                  <Indicator
                    key={idx}
                    idx={idx}
                    indicator={indicator}
                    currentIndicatorIdx={currentIndicatorIdx} 
                    isPlaying={isPlaying}
                    sharedValue={sharedValues[idx]}
                  />
                )
              })
            }
          </View>
  )
}

export default Indicators