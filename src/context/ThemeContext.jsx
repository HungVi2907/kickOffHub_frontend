import { useEffect, useMemo, useState } from 'react'
import ThemeContext, { defaultThemeState } from './themeContext.js'

const STORAGE_KEY = 'kickoffhub:theme'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultThemeState.theme)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored)
        return
      }
    } catch (err) {
      console.warn('Theme storage unavailable', err)
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch (err) {
      console.warn('Theme storage unavailable', err)
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
