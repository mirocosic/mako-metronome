import React from "react"
import { Text } from "react-native"
import { useDarkTheme } from "../utils/ui-utils"

export default (props, children) => {
  return (
    <Text style={[{color: useDarkTheme() ? "white" : "black"}, props.style]}>
      {props.value}
    </Text>

    
  )
}