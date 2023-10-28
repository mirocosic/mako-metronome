import React, { useRef } from 'react'
import { connectActionSheet } from '@expo/react-native-action-sheet'
import { BottomSheetModal,  BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import {Picker} from '@react-native-picker/picker'
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  NativeModules,
  Button,
  Alert
} from 'react-native';

import { useDarkTheme } from '../utils/ui-utils'
import palette from '../utils/palette'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'
import Copy from '../components/copy'

import RTNCalculator from 'rtn-calculator/js/NativeCalculator'

const Settings = props => {
  const dispatch = useDispatch()
  const isDarkMode = useDarkTheme()
  const theme = useSelector(state => state.settings.theme)
  const voice = useSelector(state => state.settings.voice)

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const { SoundModule } = NativeModules

  const selectTheme = () => {
    props.showActionSheetWithOptions(
      {
        options: ['Light', 'Dark', 'System', 'Cancel'],
        cancelButtonIndex: 3,
        title: 'Select app theme',
        userInterfaceStyle: theme,
        containerStyle: {
          backgroundColor: isDarkMode ? palette.dark : palette.light
        },
        textStyle: { color: isDarkMode ? palette.light : palette.dark },
        titleTextStyle: { color: isDarkMode ? palette.lightGray : palette.gray }
      },
      btnIdx => {
        switch (btnIdx) {
          case 0:
            dispatch(actions.setTheme('light'))
            break;
          case 1:
            dispatch(actions.setTheme('dark'));
            break;
          case 2:
            dispatch(actions.setTheme('system'));
            break;
          default:
            break;
        }
      }
    );
  };

  return (
    <SafeAreaView style={{ margin: 20 }}>
      <Copy value="Settings" />

      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        <Copy value="Theme" />
        <TouchableOpacity onPress={selectTheme}>
          <Text style={{ textTransform: 'capitalize', color: 'lightgray' }}>
            {theme}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        <Copy value="Sound" />
        <TouchableOpacity onPress={() => bottomSheetModalRef.current?.present()}>
          <Text style={{ textTransform: 'capitalize', color: 'lightgray' }}>
            {voice || "click"}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Click to invoke your native module!"
        color="#841584"
        onPress={() => SoundModule.playSound("Miro", "Zagreb")}
      />

      <Button
        title="Compute"
        onPress={async () => {
          const value = await RTNCalculator?.add(3, 7)
          Alert.alert('Result', `The result is ${value}`)
        }}
      />

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enablePanDownToClose={true}
        snapPoints={[250]}
        backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1}/> )}
        handleIndicatorStyle={{backgroundColor: isDarkMode ? "white" : "black"}}
        backgroundStyle={{backgroundColor: isDarkMode ? "#1f1f1f" : "white"}}
      >
        <View>
          <Picker
            selectedValue={voice || "click"}
            onValueChange={val => dispatch(actions.setVoice(val))}
            itemStyle={{color: isDarkMode? "white" : "black"}}>
            <Picker.Item label="Click" value="click" />
            <Picker.Item label="Clave" value="clave" />
          </Picker>
        </View>
      </BottomSheetModal>

    </SafeAreaView>
  )
}

export default connectActionSheet(Settings);
