import {
  CheckCircleOutlined,
  MessageOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Collapse,
  Descriptions,
  Form,
  Input,
  List,
  Modal,
  Segmented,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DemoBadge, PageHeader } from '../../components/PageHeader'
import { usePreferences } from '../../hooks/usePreferences'

const tasks = [
  {
    key: '1',
    title: '检查导航入口图标',
    owner: 'Lin',
    priority: '高',
    status: '进行中',
  },
  {
    key: '2',
    title: '整理首页分类',
    owner: 'Mo',
    priority: '中',
    status: '待处理',
  },
  {
    key: '3',
    title: '发布新版本说明',
    owner: 'Tao',
    priority: '低',
    status: '已完成',
  },
  {
    key: '4',
    title: '复核站点可用性',
    owner: 'Lin',
    priority: '高',
    status: '待处理',
  },
]
const users = [
  {
    key: '1',
    name: '林睿',
    email: 'lin@euno.dev',
    role: '管理员',
    status: '已启用',
  },
  {
    key: '2',
    name: '莫言',
    email: 'mo@euno.dev',
    role: '编辑',
    status: '已启用',
  },
  {
    key: '3',
    name: '陈思',
    email: 'chen@euno.dev',
    role: '访客',
    status: '待邀请',
  },
]
const apps = [
  { name: '导航目录', kind: '生产力', tone: '#3157d5' },
  { name: '内容收集', kind: '工作流', tone: '#0f766e' },
  { name: '团队空间', kind: '协作', tone: '#9333ea' },
  { name: '品牌资源', kind: '设计', tone: '#d97706' },
]

export function DashboardPage() {
  const [range, setRange] = useState('7 天')
  return (
    <>
      <PageHeader
        title="早上好，管理员"
        description="这是 Euno 控制台的运营概览。"
        extra={
          <Segmented
            value={range}
            options={['7 天', '30 天', '季度']}
            onChange={(value) => setRange(String(value))}
          />
        }
      />
      <div className="metric-grid">
        {[
          ['公开入口', '48', '+12%'],
          ['活跃分类', '9', '+2'],
          ['本周访问', '12,480', '+18%'],
          ['待处理任务', '6', '需关注'],
        ].map(([label, value, note]) => (
          <Card key={label} className="metric-card">
            <Typography.Text type="secondary">{label}</Typography.Text>
            <Statistic value={value} />
            <Tag color="blue">{note}</Tag>
          </Card>
        ))}
      </div>
      <div className="dashboard-grid">
        <Card title="访问趋势" extra={<DemoBadge />} className="chart-card">
          <div className="fake-chart">
            {[35, 52, 41, 69, 55, 82, 74, 91, 66, 88, 96, 78].map(
              (height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ),
            )}
          </div>
          <div className="chart-labels">
            <span>周一</span>
            <span>周三</span>
            <span>周五</span>
            <span>今天</span>
          </div>
        </Card>
        <Card title="最近活动" extra={<DemoBadge />}>
          <List
            dataSource={[
              '更新了 “开发工具” 分类',
              '新增站点 Linear',
              '成员 Mo 完成了入口复核',
              '生成了本周访问摘要',
            ]}
            renderItem={(item, index) => (
              <List.Item>
                <Space>
                  <Avatar
                    size="small"
                    style={{
                      background: ['#3157d5', '#0f766e', '#9333ea', '#d97706'][
                        index
                      ],
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  {item}
                </Space>
                <Typography.Text type="secondary">刚刚</Typography.Text>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </>
  )
}

export function DataDemoPage({
  kind,
}: {
  kind: 'tasks' | 'apps' | 'users' | 'chatbot'
}) {
  const isTable = kind === 'tasks' || kind === 'users'
  const source = kind === 'tasks' ? tasks : users
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const visible = useMemo(
    () =>
      source.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(query.toLowerCase()),
      ),
    [source, query],
  )
  const title = kind === 'tasks' ? '任务中心' : '成员管理'
  if (kind === 'apps') return <AppsPage />
  if (kind === 'chatbot') return <ChatPage />
  if (!isTable) return null
  return (
    <>
      <PageHeader
        title={title}
        description="本页面使用本地演示数据，可筛选、分页与查看详情。"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            {kind === 'tasks' ? '新建任务' : '邀请成员'}
          </Button>
        }
      />
      <Card className="data-card">
        <div className="data-toolbar">
          <Input.Search
            allowClear
            placeholder="搜索演示数据"
            onChange={(event) => setQuery(event.target.value)}
          />
          <DemoBadge />
        </div>
        <Table
          rowKey="key"
          dataSource={visible}
          pagination={{ pageSize: 5 }}
          columns={Object.keys(source[0])
            .filter((key) => key !== 'key')
            .map((key) => ({
              title:
                key === 'title'
                  ? '事项'
                  : key === 'name'
                    ? '成员'
                    : key === 'email'
                      ? '邮箱'
                      : key === 'role'
                        ? '角色'
                        : key === 'owner'
                          ? '负责人'
                          : key === 'priority'
                            ? '优先级'
                            : '状态',
              dataIndex: key,
              render: (value) =>
                ['status', 'priority', 'role'].includes(key) ? (
                  <Tag
                    color={
                      value === '已完成' || value === '已启用'
                        ? 'green'
                        : value === '高'
                          ? 'red'
                          : 'blue'
                    }
                  >
                    {value}
                  </Tag>
                ) : (
                  value
                ),
            }))}
        />
      </Card>
      <Modal
        open={open}
        title={kind === 'tasks' ? '新建演示任务' : '邀请演示成员'}
        onCancel={() => setOpen(false)}
        footer={
          <Button type="primary" onClick={() => setOpen(false)}>
            保存到本地演示
          </Button>
        }
      >
        <Form layout="vertical">
          <Form.Item label="名称">
            <Input autoFocus />
          </Form.Item>
          <Form.Item label="说明">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function AppsPage() {
  const [kind, setKind] = useState('全部')
  return (
    <>
      <PageHeader
        title="应用目录"
        description="为团队工作流准备的应用集合。"
        extra={<DemoBadge />}
      />
      <Space wrap className="app-filter">
        <Select
          value={kind}
          onChange={setKind}
          options={['全部', '生产力', '工作流', '协作', '设计'].map(
            (value) => ({ value, label: value }),
          )}
        />
      </Space>
      <div className="app-grid">
        {apps
          .filter((app) => kind === '全部' || app.kind === kind)
          .map((app) => (
            <Card key={app.name} hoverable>
              <Avatar shape="square" size={48} style={{ background: app.tone }}>
                {app.name[0]}
              </Avatar>
              <Typography.Title level={4}>{app.name}</Typography.Title>
              <Tag>{app.kind}</Tag>
              <Typography.Paragraph type="secondary">
                用于演示应用目录的卡片、筛选与悬浮状态。
              </Typography.Paragraph>
              <Button block>打开演示</Button>
            </Card>
          ))}
      </div>
    </>
  )
}

function ChatPage() {
  const [messages, setMessages] = useState(['你好，我可以帮你整理导航入口。'])
  const [value, setValue] = useState('')
  const send = () => {
    if (!value.trim()) return
    setMessages((items) => [
      ...items,
      value.trim(),
      '已收到，这是一个本地演示回复。',
    ])
    setValue('')
  }
  return (
    <>
      <PageHeader
        title="智能助手"
        description="模拟对话流、建议提示和加载状态。"
        extra={<DemoBadge />}
      />
      <Card className="chat-card">
        <div className="chat-flow">
          {messages.map((message, index) => (
            <div
              key={`${message}-${index}`}
              className={index % 2 ? 'bubble user' : 'bubble'}
            >
              <MessageOutlined /> {message}
            </div>
          ))}
        </div>
        <Space className="suggestions">
          <Button onClick={() => setValue('帮我检查失效入口')}>
            检查失效入口
          </Button>
          <Button onClick={() => setValue('生成本周摘要')}>生成本周摘要</Button>
        </Space>
        <Space.Compact block>
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onPressEnter={send}
            placeholder="输入你的问题…"
          />
          <Button type="primary" icon={<SendOutlined />} onClick={send}>
            发送
          </Button>
        </Space.Compact>
      </Card>
    </>
  )
}

export function HelpPage() {
  const [query, setQuery] = useState('')
  const items = [
    '如何管理公开网站入口？',
    '如何切换亮色与暗色主题？',
    '演示数据是否会写入后端？',
    '为什么没有后台访问权限？',
  ].filter((item) => item.includes(query))
  return (
    <>
      <PageHeader
        title="帮助中心"
        description="查找控制台使用说明与常见问题。"
        extra={<DemoBadge />}
      />
      <Card>
        <Input.Search
          placeholder="搜索帮助主题"
          onChange={(event) => setQuery(event.target.value)}
        />
        <Collapse
          className="help-list"
          items={items.map((label) => ({
            key: label,
            label,
            children:
              '这是本地演示帮助内容。真实网站入口操作会直接调用 nav-api，其余演示页不会写入后端。',
          }))}
        />
      </Card>
    </>
  )
}

export function SettingsPage() {
  const { section = 'profile' } = useParams()
  const preferences = usePreferences()
  const labels: Record<string, [string, string]> = {
    profile: ['个人资料', '查看当前账户的演示资料。'],
    account: ['账户', '演示账户与安全选项。'],
    appearance: ['外观', '这些设置会立即作用于整个控制台。'],
    notifications: ['通知', '管理本地演示通知偏好。'],
    display: ['显示', '调整控制台信息密度。'],
  }
  const [title, description] = labels[section] ?? labels.profile
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        extra={<DemoBadge />}
      />
      <div className="settings-layout">
        <Card className="settings-nav">
          <List
            size="small"
            dataSource={Object.entries(labels)}
            renderItem={([key, [label]]) => (
              <List.Item className={key === section ? 'active' : ''}>
                <a href={`#/settings/${key}`}>{label}</a>
              </List.Item>
            )}
          />
        </Card>
        <Card className="settings-main">
          {section === 'appearance' && (
            <Form layout="vertical">
              <Form.Item label="主题">
                <Select
                  value={preferences.mode}
                  onChange={preferences.setMode}
                  options={[
                    { value: 'light', label: '亮色' },
                    { value: 'dark', label: '暗色' },
                    { value: 'system', label: '跟随系统' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="说明">
                <Typography.Text type="secondary">
                  主题选择已保存到当前浏览器。
                </Typography.Text>
              </Form.Item>
            </Form>
          )}
          {section === 'display' && (
            <Form layout="vertical">
              <Form.Item label="内容密度">
                <Segmented
                  value={preferences.density}
                  options={[
                    { label: '舒适', value: 'comfortable' },
                    { label: '紧凑', value: 'compact' },
                  ]}
                  onChange={(value) =>
                    preferences.setDensity(value as 'comfortable' | 'compact')
                  }
                />
              </Form.Item>
            </Form>
          )}
          {section === 'notifications' && (
            <Form layout="vertical">
              <Form.Item label="摘要通知">
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item label="异常提醒">
                <Switch defaultChecked />
              </Form.Item>
            </Form>
          )}
          {['profile', 'account'].includes(section) && (
            <Descriptions
              column={1}
              items={[
                { key: 'name', label: '显示名称', children: 'Euno 管理员' },
                { key: 'mail', label: '邮箱', children: 'admin@euno.dev' },
                {
                  key: 'status',
                  label: '状态',
                  children: (
                    <Tag color="green">
                      <CheckCircleOutlined /> 已连接
                    </Tag>
                  ),
                },
              ]}
            />
          )}
        </Card>
      </div>
    </>
  )
}
