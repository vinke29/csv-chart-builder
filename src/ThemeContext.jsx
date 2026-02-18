import { createContext, useContext, useState } from 'react'

const dark = {
  bg: '#0d1117',
  card: '#161b22',
  border: '#21262d',
  border2: '#30363d',
  text: '#e6edf3',
  textMuted: '#8b949e',
  textSubtle: '#6e7681',
  inputBg: '#0d1117',
  // chart
  axisColor: '#6e7681',
  gridColor: '#21262d',
  tooltipBg: '#1c2128',
  tooltipBorder: '#30363d',
  tooltipColor: '#e6edf3',
  cursorFill: 'rgba(255,255,255,0.04)',
}

const light = {
  bg: '#f6f8fa',
  card: '#ffffff',
  border: '#d0d7de',
  border2: '#d0d7de',
  text: '#1f2328',
  textMuted: '#57606a',
  textSubtle: '#8c959f',
  inputBg: '#ffffff',
  // chart
  axisColor: '#57606a',
  gridColor: '#d0d7de',
  tooltipBg: '#ffffff',
  tooltipBorder: '#d0d7de',
  tooltipColor: '#1f2328',
  cursorFill: 'rgba(0,0,0,0.04)',
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)
  return (
    <ThemeContext.Provider value={{ t: isDark ? dark : light, isDark, toggle: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
