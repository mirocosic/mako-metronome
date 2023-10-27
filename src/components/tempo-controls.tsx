import React, {useState} from 'react';
import {View, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {actions} from '../store';
import Copy from '../components/copy';
import {useDarkTheme} from '../utils/ui-utils';

const TempoControls = ({scrollRef, inputRef}) => {
  const [input, setInput] = useState(100);
  const tempo = useSelector(state => state.tempo.value);
  const isDarkMode = useDarkTheme();
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{paddingHorizontal: 10}}
        onPress={() => {
          scrollRef.current.scrollTo({
            x: (tempo - 5) * 10,
            y: 0,
            animated: true
          });
        }}>
        <Copy style={{fontSize: 25, color: isDarkMode ? "lightgray" : "black"}} value="-5" />
      </TouchableOpacity>

      <TouchableOpacity
        style={{paddingHorizontal: 10}}
        onPress={() => {
          scrollRef.current.scrollTo({
            x: (tempo - 1) * 10,
            y: 0,
            animated: true
          });
        }}>
        <Copy style={{fontSize: 30, color: isDarkMode ? "lightgray" : "black"}} value="-1" />
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        style={[styles.inputStyle, {color: isDarkMode ? 'lightgray' : 'black'}]}
        value={
          inputRef.current && inputRef.current.isFocused()
            ? String(input)
            : String(tempo)
        }
        keyboardType="number-pad"
        returnKeyType={'done'}
        onFocus={() => setInput('')}
        onChangeText={v => {
          setInput(v);
        }}
        onSubmitEditing={() => {
          if (Number(input) > 0 && Number(input) < 400) {
            dispatch(actions.saveTempo(Number(input)));
            scrollRef.current.scrollTo({
              x: Number(input) * 10,
              y: 0,
              animated: true
            });
          } else {
            setInput(String(tempo))
          }
        }}
      />

      <TouchableOpacity
        style={{paddingHorizontal: 10}}
        onPress={() => {
          scrollRef.current.scrollTo({
            x: (tempo + 1) * 10,
            y: 0,
            animated: true
          });
        }}>
        <Copy style={{fontSize: 30, color: isDarkMode ? "lightgray" : "black"}} value="+1" />
      </TouchableOpacity>

      <TouchableOpacity
        style={{paddingHorizontal: 10}}
        onPress={() => {
          scrollRef.current.scrollTo({
            x: (tempo + 5) * 10,
            y: 0,
            animated: true
          });
        }}>
        <Copy style={{fontSize: 25, color: isDarkMode ? "lightgray" : "black"}} value="+5" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    //flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  inputStyle: {
    fontSize: 40,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    width: 100,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
});

export default TempoControls;
