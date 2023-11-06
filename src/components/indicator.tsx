import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'

const styles = StyleSheet.create({
  outerCircle: {
    //flex: 1,
    // maxWidth: 50,
    width: 50,
    height: 50, 
    borderRadius: 100,
    borderColor: "lightgray",
    borderStyle: "dashed",
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  
  innerCircle: {
    opacity: 0,
    width: 35,
    height: 35,
    borderRadius: 100,
    borderColor: "lightgray",
    backgroundColor: "lightgray",
  
  }
})

const Indicator = ({idx, indicator, currentIndicatorIdx, isPlaying, sharedValues}) => {

  const dispatch = useDispatch()
  const indicators = useSelector(state => state.indicators)

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      sharedValues.value[idx],
      [0, 1],
      ["lightgray", "blue"]
    )
    return {
      backgroundColor,
    }
  })

  const borderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      sharedValues.value[idx],
      [0, 1],
      ["lightgray", "blue"]
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
                !indicator.levels[0].active && {opacity: 0.5},
                indicator.levels[0].active && {borderStyle: "solid"},
                indicator.levels[0].active && borderStyle,
                {marginHorizontal: 20 / indicators.length}]}>

        <Animated.View
          style={[styles.innerCircle,
                  indicator.levels[1].active && {opacity: 1},
                  indicator.levels[1].active && backgroundStyle]}/>

      </Animated.View>

    </TouchableOpacity>
  )
}

export default Indicator