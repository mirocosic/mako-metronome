import React from "react"
import Slider from '@react-native-community/slider'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'

const VolumeControls = () => {
  const dispatch = useDispatch()
  const volume = useSelector(state => state.settings.volume)

  return (
    <Slider
      style={{width: 200, height: 40}}
      minimumValue={0}
      maximumValue={1}
      value={volume}
      minimumTrackTintColor="#FFFFFF"
      maximumTrackTintColor="darkgray"
      onSlidingComplete={ v => dispatch(actions.setVolume(v)) }/>
  )
}

export default VolumeControls