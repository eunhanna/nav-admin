import {
  AppstoreOutlined,
  BellOutlined,
  BulbOutlined,
  CompressOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DownOutlined,
  ExpandOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Space,
  Spin,
  Tooltip,
} from 'antd'
import type { MenuProps } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AuthUser,
  getCurrentUser,
  isApiConfigured,
  logout,
  restoreSession,
} from '../api'
import { usePreferences } from '../hooks/usePreferences'

const titles: Record<string, string> = {
  '/dashboard': '概览',
  '/sites': '网站入口',
  '/sites/order': '入口排序',
  '/tasks': '任务中心',
  '/apps': '应用目录',
  '/users': '成员管理',
  '/chatbot': '智能助手',
  '/help': '帮助中心',
}
const menuItems: MenuProps['items'] = [
  {
    type: 'group',
    label: '概览',
    children: [
      { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    ],
  },
  {
    type: 'group',
    label: '工作区',
    children: [
      { key: '/sites', icon: <DatabaseOutlined />, label: '网站入口' },
      {
        key: '/sites/order',
        icon: <SortAscendingOutlined />,
        label: '入口排序',
      },
      { key: '/tasks', icon: <FileTextOutlined />, label: '任务中心' },
      { key: '/apps', icon: <AppstoreOutlined />, label: '应用目录' },
      { key: '/users', icon: <TeamOutlined />, label: '成员管理' },
      { key: '/chatbot', icon: <MessageOutlined />, label: '智能助手' },
    ],
  },
  {
    type: 'group',
    label: '系统',
    children: [
      { key: '/settings/profile', icon: <SettingOutlined />, label: '设置' },
      { key: '/help', icon: <QuestionCircleOutlined />, label: '帮助中心' },
    ],
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const preferences = usePreferences()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => {
    if (!isApiConfigured) {
      navigate('/login', { replace: true })
      return
    }
    restoreSession()
      .then(() => getCurrentUser())
      .then((current) => {
        if (current.role !== 'admin') {
          navigate('/login', { replace: true })
          return
        }
        setUser(current)
      })
      .catch(() => navigate('/login', { replace: true }))
      .finally(() => setLoading(false))
  }, [navigate])
  const current = useMemo(
    () =>
      titles[location.pathname] ??
      (location.pathname.startsWith('/settings') ? '设置' : '管理后台'),
    [location.pathname],
  )
  const side = (
    <div className="sidebar-shell">
      <div className="brand-panel">
        <img src="/brand/euno/euno-horizontal-white.svg" alt="Euno" />
        <span>CONTROL</span>
      </div>
      <div className="sidebar-menu">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            setMobileOpen(false)
            navigate(key)
          }}
        />
      </div>
      <div className="sidebar-footer">
        <a href="https://eunhacc.cyou/">返回用户端</a>
        <span>v0.1 · 演示工作台</span>
      </div>
    </div>
  )
  if (loading)
    return (
      <main className="loading">
        <Spin size="large" />
      </main>
    )
  if (!user) return null
  const accountItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人设置' },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: '退出登录',
    },
  ]
  return (
    <Layout className={`admin-layout ${preferences.density}`}>
      <Layout.Sider
        className="desktop-sider"
        collapsible
        collapsed={preferences.collapsed}
        trigger={null}
        width={256}
      >
        {side}
      </Layout.Sider>
      <Drawer
        className="mobile-nav"
        placement="left"
        width={276}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        closable={false}
      >
        {side}
      </Drawer>
      <Layout>
        <Layout.Header className="app-header">
          <Space>
            <Button
              className="mobile-menu"
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
            />
            <Tooltip title={preferences.collapsed ? '展开侧栏' : '收起侧栏'}>
              <Button
                className="desktop-toggle"
                type="text"
                icon={
                  preferences.collapsed ? (
                    <ExpandOutlined />
                  ) : (
                    <CompressOutlined />
                  )
                }
                onClick={() => preferences.setCollapsed(!preferences.collapsed)}
              />
            </Tooltip>
            <Divider type="vertical" />
            <span className="header-location">
              Euno / <strong>{current}</strong>
            </span>
          </Space>
          <Space size={6}>
            <Tooltip title="切换亮暗主题">
              <Button
                type="text"
                icon={<BulbOutlined />}
                onClick={() =>
                  preferences.setMode(preferences.isDark ? 'light' : 'dark')
                }
              />
            </Tooltip>
            <Badge dot>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown
              menu={{
                items: accountItems,
                onClick: ({ key }) => {
                  if (key === 'profile') navigate('/settings/profile')
                  if (key === 'logout')
                    void logout().finally(() => navigate('/login'))
                },
              }}
              trigger={['click']}
            >
              <Button type="text" className="user-menu">
                <Avatar size="small">{user.email[0].toUpperCase()}</Avatar>
                <span>{user.email}</span>
                <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Layout.Header>
        <Layout.Content className="app-content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
