import React from 'react'
import { connectActionSheet } from '@expo/react-native-action-sheet'
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import { useDarkTheme } from '../utils/ui-utils'
import palette from '../utils/palette'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../store'
import Copy from '../components/copy'

const Settings = props => {
  const dispatch = useDispatch();
  const darkMode = useDarkTheme();
  const theme = useSelector(state => state.settings.theme);

  const selectTheme = () => {
    props.showActionSheetWithOptions(
      {
        options: ['Light', 'Dark', 'System', 'Cancel'],
        cancelButtonIndex: 3,
        title: 'Select app theme',
        userInterfaceStyle: theme,
        containerStyle: {
          backgroundColor: darkMode ? palette.dark : palette.light
        },
        textStyle: { color: darkMode ? palette.light : palette.dark },
        titleTextStyle: { color: darkMode ? palette.lightGray : palette.gray }
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
          <Text style={{ textTransform: 'capitalize', color: 'gray' }}>
            {theme}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default connectActionSheet(Settings);
