import { App as AntApp, ConfigProvider } from 'antd'
import { HashRouter } from 'react-router-dom'
import App from '../App'
import { usePreferences } from '../hooks/usePreferences'

export function ThemeRoot() {
  const preferences = usePreferences()
  return (
    <ConfigProvider
      theme={{
        algorithm: preferences.algorithm,
        token: {
          colorPrimary: '#1d4ed8',
          borderRadius: 8,
          controlHeight: preferences.density === 'compact' ? 30 : 36,
          fontSize: preferences.density === 'compact' ? 13 : 14,
          fontFamily: 'Open Sans, Arial, sans-serif',
        },
      }}
    >
      <AntApp>
        <HashRouter>
          <App />
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  )
}
