import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'

const styles = StyleSheet.create({
  outerCircle: {
    //flex: 1,
    maxWidth: 50,
    maxHeight: 50,
    // width: 20,
    // height: 20, 
    borderRadius: 100,
    borderColor: "lightgray",
    borderStyle: "dashed",
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    
  },
  
  innerCircle: {
    opacity: 0,
    maxWidth: 35,
    maxHeight: 35,
    borderRadius: 100,
    borderColor: "lightgray",
    backgroundColor: "lightgray",
  
  }
})

const Indicator = ({idx, indicator, currentIndicatorIdx, isPlaying, sharedValues}) => {

  const dispatch = useDispatch()
  const indicators = useSelector(state => state.indicators)

  const {height, width} = useWindowDimensions()
  const screenWidth = width

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      sharedValues.value[idx],
      [0, 1],
      ["lightgray", "teal"]
    )
    return {
      backgroundColor,
    }
  })

  const borderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      sharedValues.value[idx],
      [0, 1],
      ["lightgray", "teal"]
    )
    return {
      borderColor,
    }
  })

  return (
    <TouchableOpacity
      key={idx}
      onPress={() => dispatch(actions.toggleIndicator({idx}))}>

      <Animated.View 
        style={[styles.outerCircle,
                {width: (screenWidth / indicators.length - 10), height: (screenWidth / indicators.length - 10)},
                !indicator.levels[0].active && {opacity: 0.5},
                indicator.levels[0].active && {borderStyle: "solid"},
                indicator.levels[0].active && borderStyle,
                {marginHorizontal: 30 / indicators.length}]}>

        <Animated.View
          style={[styles.innerCircle,
                  {width: (screenWidth / indicators.length - 25), height: (screenWidth / indicators.length - 25)},
                  indicator.levels[1].active && {opacity: 1},
                  indicator.levels[1].active && backgroundStyle]}/>

      </Animated.View>

    </TouchableOpacity>
  )
}

export default Indicator