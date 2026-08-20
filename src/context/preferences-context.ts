import { theme as antdTheme } from 'antd'
import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Density = 'comfortable' | 'compact'

export type Preferences = {
  mode: ThemeMode
  density: Density
  collapsed: boolean
  setMode: (mode: ThemeMode) => void
  setDensity: (density: Density) => void
  setCollapsed: (collapsed: boolean) => void
  isDark: boolean
  algorithm: typeof antdTheme.defaultAlgorithm
}

export const PreferencesContext = createContext<Preferences | null>(null)
