import ReactDOM from 'react-dom/client'
import 'antd/dist/reset.css'
import './styles.css'
import { ThemeRoot } from './components/ThemeRoot'
import { PreferencesProvider } from './context/preferences'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PreferencesProvider>
    <ThemeRoot />
  </PreferencesProvider>,
)
