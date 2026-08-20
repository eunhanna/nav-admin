import { theme as antdTheme } from 'antd'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Density, PreferencesContext, ThemeMode } from './preferences-context'
const read = <T,>(key: string, fallback: T) => {
  try {
    return (localStorage.getItem(key) as T) || fallback
  } catch {
    return fallback
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    read<ThemeMode>('euno-theme', 'system'),
  )
  const [density, setDensity] = useState<Density>(() =>
    read<Density>('euno-density', 'comfortable'),
  )
  const [collapsed, setCollapsed] = useState(
    () => read<string>('euno-sidebar', 'false') === 'true',
  )
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const change = () => setSystemDark(query.matches)
    query.addEventListener('change', change)
    return () => query.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    localStorage.setItem('euno-theme', mode)
    localStorage.setItem('euno-density', density)
    localStorage.setItem('euno-sidebar', String(collapsed))
  }, [mode, density, collapsed])
  const isDark = mode === 'dark' || (mode === 'system' && systemDark)
  const value = useMemo(
    () => ({
      mode,
      density,
      collapsed,
      setMode,
      setDensity,
      setCollapsed,
      isDark,
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    }),
    [mode, density, collapsed, isDark],
  )
  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}
