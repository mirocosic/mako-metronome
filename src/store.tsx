import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistStore, persistReducer, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, } from 'redux-persist'
import { createSlice, configureStore, combineReducers } from '@reduxjs/toolkit'
import settings from './screens/settings'

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
  initialState: [{name: "Init preset", tempo: 37, vibrate: true}],
  reducers: {
    savePreset: (state, {payload: {name, tempo, vibrate}}) => {
      state.push({name,tempo, vibrate})
    }, 
    loadPreset: (state, action) => {
      console.log(action)
    },
    clearPresets: (state) => {
      state.length = 0
    }
  }
})

const indicatorsSlice = createSlice({
  name: "indicators",
  initialState: [{active: true, indicating: false},
                 {active: true, indicating: false},
                 {active: true, indicating: false},
                 {active: true, indicating: false}],
  reducers: {
    toggleIndicator: (state, {payload}) => {
      state[payload.idx].active = payload.active
    },
    flashIndicator: (state, { payload }) => {
      state[payload.idx].indicating = payload.indicating
    }
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
  flashIndicator: indicatorsSlice.actions.flashIndicator,
  setTheme: settingsSlice.actions.setTheme,
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