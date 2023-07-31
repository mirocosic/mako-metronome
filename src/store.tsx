import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistStore, persistReducer, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, } from 'redux-persist'
import { createSlice, configureStore, combineReducers } from '@reduxjs/toolkit'
import uuid from 'react-native-uuid';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    vibrate: false,
    sound: true,
    theme: "dark",
    volume: 0.5
  },
  reducers: {
    setVibrate: (state, {payload}) => {
      state.vibrate = payload
    },
    toggleSound: (state, {payload}) => {
      state.sound = payload
    },
    setTheme: (state, {payload}) => {
      state.theme = payload
    },
    setVolume: (state, {payload}) => {
      state.volume = payload
    }
  }
})

const tempoSlice = createSlice({
  name: 'tempo',
  initialState: {
    value: 120
  },
  reducers: {
    saveTempo: (state, action) => {
      state.value = action.payload
    },
    loadTempo: (state, action) => {
      state.value = action.payload
    },
  }
})

const presetSlice = createSlice({
  name: "presets",
  initialState: [],
  reducers: {
    savePreset: (state, {payload: {name, tempo, vibrate}}) => {
      state.push({id: uuid.v4(),
                  name: name,
                  tempo: tempo,
                  vibrate: vibrate})
    }, 
    loadPreset: (state, action) => {
      console.log(action)
    },
    deletePreset: (state, action) => {
      return state.filter(preset => preset.id !== action.payload)
    },

    clearPresets: (state) => {
      state.length = 0
    }
  }
})

const indicatorsSlice = createSlice({
  name: "indicators",
  initialState: [{levels: [{active: true}, {active: true}]},
                 {levels: [{active: true}, {active: true}]},
                 {levels: [{active: true}, {active: true}]},
                 {levels: [{active: true}, {active: true}]}],
  reducers: {
    toggleIndicator: (state, {payload}) => {
      if (!state[payload.idx].levels[0].active) {
        state[payload.idx].levels[0].active = true
      } else if (!state[payload.idx].levels[1].active) {
        state[payload.idx].levels[1].active = true
      } else {
        state[payload.idx].levels = [{active: false}, {active: false}]
      }
      
    },
  }
})

export const actions = {
  saveTempo: tempoSlice.actions.saveTempo,
  loadTempo: tempoSlice.actions.loadTempo,
  savePreset: presetSlice.actions.savePreset,
  loadPreset: presetSlice.actions.loadPreset,
  clearPresets: presetSlice.actions.clearPresets,
  setVibrate: settingsSlice.actions.setVibrate,
  toggleSound: settingsSlice.actions.toggleSound,
  toggleIndicator: indicatorsSlice.actions.toggleIndicator,
  setTheme: settingsSlice.actions.setTheme,
  setVolume: settingsSlice.actions.setVolume,
  deletePreset: presetSlice.actions.deletePreset
}

const reducers = combineReducers({
  tempo: tempoSlice.reducer,
  presets: presetSlice.reducer,
  settings: settingsSlice.reducer,
  indicators: indicatorsSlice.reducer,
})

const persistedReducer = persistReducer(persistConfig, reducers)
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})
export const persistor = persistStore(store)