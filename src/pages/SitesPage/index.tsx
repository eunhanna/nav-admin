import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useCallback, useEffect, useState } from 'react'
import {
  AdminSiteInput,
  createAdminSite,
  deleteAdminSite,
  getAdminSites,
  PublicSite,
  toggleAdminSite,
  updateAdminSite,
} from '../../api'
import { PageHeader } from '../../components/PageHeader'
import { SiteEditorDrawer } from './SiteEditorDrawer'
function SiteAvatar({ site }: { site: PublicSite }) {
  const [failed, setFailed] = useState(false)
  return site.iconUrl && !failed ? (
    <img
      className="site-avatar"
      src={site.iconUrl}
      alt=""
      onError={() => setFailed(true)}
    />
  ) : (
    <span
      className="site-avatar fallback"
      style={{ background: site.fallbackColor }}
    >
      {site.fallbackIcon || site.name.slice(0, 1)}
    </span>
  )
}
export default function SitesPage() {
  const { message } = App.useApp()
  const [sites, setSites] = useState<PublicSite[]>([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [allTotal, setAllTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [editing, setEditing] = useState<PublicSite | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const load = useCallback(async () => {
    setLoading(true)
    try {
      setError('')
      const response = await getAdminSites({
        page,
        pageSize,
        query,
        category: category ?? undefined,
      })
      setSites(response.sites)
      setTotal(response.total)
      setAllTotal(response.allTotal)
      setCategories(response.categories)
    } catch {
      setError('无法读取网站入口，请检查后台服务。')
    } finally {
      setLoading(false)
    }
  }, [category, page, pageSize, query])
  useEffect(() => {
    void load()
  }, [load])
  const open = (site?: PublicSite) => {
    setEditing(site ?? null)
    setDrawer(true)
  }
  const save = async (values: AdminSiteInput) => {
    setSaving(true)
    try {
      if (editing) await updateAdminSite(editing.id, values)
      else await createAdminSite(values)
      setDrawer(false)
      await load()
      message.success(editing ? '网站入口已更新' : '网站入口已创建')
    } catch {
      setError('保存失败，请检查字段或稍后重试。')
    } finally {
      setSaving(false)
    }
  }
  const toggleEnabled = async (site: PublicSite, enabled: boolean) => {
    if (togglingIds.has(site.id)) return
    const previousEnabled = site.enabled
    setSites((current) =>
      current.map((item) =>
        item.id === site.id ? { ...item, enabled } : item,
      ),
    )
    setTogglingIds((current) => new Set(current).add(site.id))
    try {
      await toggleAdminSite(site.id, enabled)
    } catch {
      setSites((current) =>
        current.map((item) =>
          item.id === site.id ? { ...item, enabled: previousEnabled } : item,
        ),
      )
      setError('状态更新失败，已恢复原状态。')
    } finally {
      setTogglingIds((current) => {
        const next = new Set(current)
        next.delete(site.id)
        return next
      })
    }
  }
  const columns: ColumnsType<PublicSite> = [
    {
      title: '网站',
      render: (_, site) => (
        <Space>
          <SiteAvatar site={site} />
          <span>
            <Typography.Text strong>{site.name}</Typography.Text>
            <br />
            <Typography.Text type="secondary" className="url-text">
              {site.url}
            </Typography.Text>
          </span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'category',
      width: 130,
      filters: categories.map((value) => ({ text: value, value })),
      filteredValue: category ? [category] : null,
      filterMultiple: false,
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: '状态',
      width: 110,
      render: (_, site) => (
        <Switch
          checked={site.enabled}
          checkedChildren="启用"
          unCheckedChildren="停用"
          loading={togglingIds.has(site.id)}
          onChange={(enabled) => void toggleEnabled(site, enabled)}
        />
      ),
    },
    {
      title: '操作',
      width: 110,
      render: (_, site) => (
        <Space>
          <Button
            aria-label={`编辑 ${site.name}`}
            type="text"
            icon={<EditOutlined />}
            onClick={() => open(site)}
          />
          <Popconfirm
            title={`确定删除“${site.name}”吗？`}
            onConfirm={async () => {
              try {
                await deleteAdminSite(site.id)
                await load()
                message.success('网站入口已删除')
              } catch {
                setError('删除失败，请稍后重试。')
              }
            }}
          >
            <Button
              danger
              aria-label={`删除 ${site.name}`}
              type="text"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]
  return (
    <>
      <PageHeader
        title="网站入口"
        description="管理面向所有用户展示的公开网站入口。"
        extra={
          <Space>
            <Button icon={<SortAscendingOutlined />} href="#/sites/order">
              入口排序
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => open()}
            >
              新增入口
            </Button>
          </Space>
        }
      />
      {error && (
        <Alert
          className="error"
          type="error"
          showIcon
          title={error}
          closable={{ onClose: () => setError('') }}
        />
      )}
      <Card className="data-card">
        <div className="data-toolbar">
          <Input.Search
            placeholder="搜索网站入口"
            allowClear
            value={searchInput}
            onSearch={(value) => {
              setQuery(value.trim())
              setPage(1)
            }}
            onChange={(event) => {
              const value = event.target.value
              setSearchInput(value)
              if (!value) {
                setQuery('')
                setPage(1)
              }
            }}
          />
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={() => void load()}>
              刷新
            </Button>
          </Space>
        </div>
        <Table
          className="sites-table"
          rowKey="id"
          columns={columns}
          dataSource={sites}
          loading={loading}
          sticky={{ offsetHeader: 0 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100],
            showQuickJumper: true,
          }}
          onChange={(pagination, filters, _sorter, extra) => {
            const nextCategory = filters.category?.[0]
            setCategory(typeof nextCategory === 'string' ? nextCategory : null)
            setPageSize(pagination.pageSize ?? pageSize)
            setPage(extra.action === 'filter' ? 1 : (pagination.current ?? 1))
          }}
          locale={{ emptyText: <Empty description="暂无匹配的网站入口" /> }}
        />
      </Card>
      <SiteEditorDrawer
        open={drawer}
        site={editing}
        categories={Array.from(new Set(['常用', ...categories]))}
        defaultPosition={allTotal}
        saving={saving}
        onClose={() => setDrawer(false)}
        onSubmit={save}
      />
    </>
  )
}
