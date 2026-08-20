import { useContext } from 'react'
import { PreferencesContext } from '../context/preferences-context'

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('PreferencesProvider is required')
  return value
}
