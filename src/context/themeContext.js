import { createContext } from 'react'

export const defaultThemeState = {
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
}

const ThemeContext = createContext(defaultThemeState)

export default ThemeContext
