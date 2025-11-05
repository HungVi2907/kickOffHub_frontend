import { useContext } from 'react'
import ThemeContext from '../context/themeContext.js'

export default function useTheme() {
	return useContext(ThemeContext)
}
