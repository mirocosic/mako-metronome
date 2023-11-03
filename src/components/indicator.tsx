import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'

const styles = StyleSheet.create({
  indicatorBox: {
    flex: 1,
    maxWidth: 50,
    height: 50, 
    borderRadius: 6,
    borderColor: "lightgray", 
    borderWidth: 1,
  },
  indicatorLevelTop: {
    flex: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  indicatorLevelBottom: {
    flex: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  }
})

const Indicator = ({idx, indicator, currentIndicatorIdx, isPlaying, sharedValue}) => {

  const dispatch = useDispatch()
  const indicators = useSelector(state => state.indicators)

  //const sharedValue = useSharedValue(0)

  const rStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      sharedValue.value,
      [0, 1],
      ["gray", "red"]
    )
    return {
      backgroundColor,
    }
  })

  // const toggleIndicator = () => {
  //   sharedValue.value = withTiming(1, {duration: 50})
  //   setTimeout(() => {
  //     sharedValue.value = withTiming(0, {duration: 50})
  //   }, 100)
  // }

  // useEffect(() => {
  //   if ((currentIndicatorIdx === idx) && isPlaying) {
  //     toggleIndicator()
  //   }
  // })

  return (
    <TouchableOpacity
      key={idx}
      style={[styles.indicatorBox,
              indicator.indicating && {borderColor: "teal"},
              {marginHorizontal: 20 / indicators.length}
            ]}
      onPress={() => dispatch(actions.toggleIndicator({idx}))}>
        
      <Animated.View style={[styles.indicatorLevelTop,
                              indicator.levels[1].active && {backgroundColor: "gray"},
                              indicator.levels[1].active && rStyle,
                              ]}/>
      <Animated.View style={[styles.indicatorLevelBottom,
                              indicator.levels[0].active && {backgroundColor: "gray"},
                              indicator.levels[0].active && rStyle,
                      ]}/>
    </TouchableOpacity>
  )
}

export default Indicator