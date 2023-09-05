import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import ContextMenu from 'react-native-context-menu-view';
import { useSelector, useDispatch } from 'react-redux';
import { actions } from '../store';
import { Ionicons } from '@expo/vector-icons';
import Copy from "../components/copy"

const MetronomeHeader = ({ setPresetDialogVisible }) => {
  const dispatch = useDispatch();

  const tempo = useSelector(state => state.tempo.value);
  const currentPreset = useSelector(state => state.settings.currentPreset);
  const isVibrateEnabled = useSelector(state => state.settings.vibrate);
  const isSoundEnabled = useSelector(state => state.settings.sound);
  const volume = useSelector(state => state.settings.volume);
  const indicators = useSelector(state => state.indicators);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1 }}>
        {currentPreset.name !== '' ? (
          <Copy value={`Preset: ${currentPreset.name}`} />
        ) : null}
      </View>

      <ContextMenu
        dropdownMenuMode
        actions={[
          { title: 'Save', subtitle: 'Save current preset' },
          { title: 'Save As ', subtitle: 'Save as a new preset' },
          { title: 'Cancel', destructive: true }
        ]}
        onPress={e => {
          switch (e.nativeEvent.index) {
            case 0:
              dispatch(
                actions.updatePreset({
                  id: currentPreset.id,
                  name: currentPreset.name,
                  tempo: tempo,
                  vibrate: isVibrateEnabled,
                  sound: isSoundEnabled,
                  volume: volume,
                  indicators: indicators
                })
              );
              break;
            case 1:
              setPresetDialogVisible(true);
              break;
          }
        }}>
        <View
          style={styles.saveButton}>
          <Ionicons name="ios-save" size={16} color="black" />
        </View>
      </ContextMenu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center'
  },
  saveButton: {
      backgroundColor: 'lightblue',
      width: 40,
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      margin: 10
    }
})

export default MetronomeHeader;
