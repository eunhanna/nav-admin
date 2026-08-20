import {
  App,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Tooltip,
} from 'antd'
import { useEffect, useState } from 'react'
import type { AdminSiteInput, PublicSite } from '../../api'

type IconOption = { label: string; url: string }

const emptyForm: AdminSiteInput = {
  name: '',
  url: '',
  category: '常用',
  iconUrl: '',
  fallbackIcon: '',
  enabled: true,
  position: 0,
}

const fallbackColors = [
  '#1976D2',
  '#0F766E',
  '#7C3AED',
  '#DB2777',
  '#D97706',
  '#64748B',
]

function iconOptionsFor(url: string): IconOption[] {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`)
    const host = parsed.hostname.replace(/^www\./, '')
    return [
      { label: '站点 Logo', url: `https://logo.clearbit.com/${host}` },
      {
        label: 'Google 图标',
        url: `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(parsed.href)}`,
      },
      {
        label: 'DuckDuckGo 图标',
        url: `https://icons.duckduckgo.com/ip3/${host}.ico`,
      },
    ]
  } catch {
    return []
  }
}

interface SiteEditorDrawerProps {
  open: boolean
  site: PublicSite | null
  categories: string[]
  defaultPosition: number
  saving: boolean
  onClose: () => void
  onSubmit: (values: AdminSiteInput) => Promise<void>
}

export function SiteEditorDrawer({
  open,
  site,
  categories,
  defaultPosition,
  saving,
  onClose,
  onSubmit,
}: SiteEditorDrawerProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<AdminSiteInput>()
  const [iconOptions, setIconOptions] = useState<IconOption[]>([])

  useEffect(() => {
    if (!open) return
    setIconOptions([])
    form.setFieldsValue(site ?? { ...emptyForm, position: defaultPosition })
  }, [defaultPosition, form, open, site])

  const fillFromUrl = () => {
    const url = form.getFieldValue('url')
    const options = iconOptionsFor(url)
    if (!options.length) return

    const host = new URL(
      url.includes('://') ? url : `https://${url}`,
    ).hostname.replace(/^www\./, '')
    setIconOptions(options)
    form.setFieldsValue({
      iconUrl: options[0].url,
      name: form.getFieldValue('name') || host.split('.')[0],
      fallbackIcon: form.getFieldValue('fallbackIcon') || host[0].toUpperCase(),
    })
    message.success('已填入网站名称和图标候选')
  }

  return (
    <Drawer
      title={site ? '编辑入口' : '新增入口'}
      width={460}
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={
        <Button type="primary" loading={saving} onClick={() => form.submit()}>
          {site ? '保存修改' : '创建入口'}
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="url"
          label="网址"
          rules={[
            {
              required: true,
              type: 'url',
              message: '请输入 http 或 https 地址',
            },
          ]}
        >
          <Input
            placeholder="https://example.com"
            suffix={
              <Button type="link" onClick={fillFromUrl}>
                获取图标
              </Button>
            }
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="网站名称"
          rules={[{ required: true, max: 20 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="category" label="分类" rules={[{ required: true }]}>
          <Select
            options={categories.map((value) => ({ value, label: value }))}
          />
        </Form.Item>
        <Form.Item name="iconUrl" label="图标地址">
          <Input />
        </Form.Item>
        {iconOptions.length > 0 && (
          <Form.Item label="备选图标">
            <Space wrap>
              {iconOptions.map((option) => (
                <Tooltip key={option.url} title={option.label}>
                  <Button
                    className="icon-option"
                    onClick={() => form.setFieldValue('iconUrl', option.url)}
                  >
                    <img src={option.url} alt={option.label} />
                  </Button>
                </Tooltip>
              ))}
            </Space>
          </Form.Item>
        )}
        <Form.Item name="fallbackIcon" label="备用首字母">
          <Input maxLength={8} />
        </Form.Item>
        <Form.Item name="fallbackColor" label="备选底色">
          <Select
            allowClear
            options={fallbackColors.map((value) => ({ value, label: value }))}
          />
        </Form.Item>
        <Form.Item name="enabled" label="启用入口" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="position" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
