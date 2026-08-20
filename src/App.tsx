import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import SitesPage from './pages/SitesPage'
import SitesOrderPage from './pages/SitesOrderPage'
import LoginPage from './pages/LoginPage'
import {
  DashboardPage,
  DataDemoPage,
  HelpPage,
  SettingsPage,
} from './pages/demos/DemoPages'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/sites/order" element={<SitesOrderPage />} />
        <Route path="/tasks" element={<DataDemoPage kind="tasks" />} />
        <Route path="/apps" element={<DataDemoPage kind="apps" />} />
        <Route path="/users" element={<DataDemoPage kind="users" />} />
        <Route path="/chatbot" element={<DataDemoPage kind="chatbot" />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings/:section" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
