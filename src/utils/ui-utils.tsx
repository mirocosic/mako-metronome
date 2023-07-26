import { useSelector } from "react-redux"
import { useColorScheme } from "react-native"

// returns the theme used ('light'|'dark') that is read either from system or app state 
export const useTheme = () => {
  const theme = useSelector(state => state.settings.theme)
  const systemTheme = useColorScheme()
  return theme === "system" ? systemTheme : theme
}

// returns 'true' if dark theme is selected on system or in app
export const useDarkTheme = () => {
  const theme = useSelector(state => state.settings.theme)
  const systemTheme = useColorScheme()
  return theme === "system" ? systemTheme === "dark" : theme === "dark"
}