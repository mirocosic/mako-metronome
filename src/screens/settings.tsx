import React, { useRef } from 'react'
import { connectActionSheet } from '@expo/react-native-action-sheet'
import { BottomSheetModal,  BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Button
} from 'react-native';

import { useDarkTheme } from '../utils/ui-utils'
import palette from '../utils/palette'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'
import Copy from '../components/copy'
import moment from 'moment';
import 'moment-duration-format';

import * as Application from 'expo-application';



const Settings = props => {
  const dispatch = useDispatch()
  const isDarkMode = useDarkTheme()
  const theme = useSelector(state => state.settings.theme)
  const voice = useSelector(state => state.settings.voice)
  const totalTimeUsage = useSelector(state => state.settings.totalTimeUsage)

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

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
        tintColor: palette.teal,
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
    <SafeAreaView style={{ margin: 20, flex: 1 }}>
      <Copy style={{textAlign: "center"}} value="Settings" />

      <View
        style={{
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderColor: "gray"

        }}>
        <Copy value="Theme" />
        <TouchableOpacity onPress={selectTheme}>
          <Text style={{ textTransform: 'capitalize', color: palette.teal }}>
            {theme}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderColor: "gray"
        }}>
        <Copy value="Sound" />
        <TouchableOpacity onPress={() => bottomSheetModalRef.current?.present()}>
          <Text style={{ textTransform: 'capitalize', color: palette.teal }}>
            {voice || "click"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderColor: "gray"
        }}>
        <Copy value="Total time usage" />
        <Copy value={moment.duration((totalTimeUsage / 1000), "seconds").format("hh[h]:mm[m]:ss[s]")}></Copy>
      </View>

      <View style={{flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, flex: 1, alignItems: "flex-end"}}>
        <Copy value={`Version: ${Application.nativeApplicationVersion}`}></Copy>
        <Copy value={`Build: ${Application.nativeBuildVersion}`}></Copy>
      </View>
      

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
          <Button title="Click" color={palette.teal} onPress={() => dispatch(actions.setVoice("click"))} />
          <Button title="Clave" color={palette.teal} onPress={() => dispatch(actions.setVoice("clave"))} />
          
        </View>
      </BottomSheetModal>

    </SafeAreaView>
  )
}

export default connectActionSheet(Settings);
