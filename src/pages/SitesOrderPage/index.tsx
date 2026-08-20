import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { Alert, Card, Empty, Spin, Typography } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import {
  getAdminSitesForOrdering,
  PublicSite,
  reorderAdminSites,
} from '../../api'
import { PageHeader } from '../../components/PageHeader'
import { SortableSiteCard } from './SortableSiteCard'

function sortSites(sites: PublicSite[]) {
  return [...sites].sort(
    (a, b) => a.position - b.position || a.id.localeCompare(b.id),
  )
}

export default function SitesOrderPage() {
  const [sites, setSites] = useState<PublicSite[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const load = useCallback(async () => {
    try {
      setError('')
      const response = await getAdminSitesForOrdering()
      setSites(sortSites(response.sites))
    } catch {
      setError('无法读取网站入口，请检查后台服务。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (saving || !over || active.id === over.id) return
    const from = sites.findIndex((site) => site.id === active.id)
    const to = sites.findIndex((site) => site.id === over.id)
    if (from < 0 || to < 0) return

    const next = arrayMove(sites, from, to).map((site, position) => ({
      ...site,
      position,
    }))
    setSites(next)
    setSaving(true)
    try {
      await reorderAdminSites(
        next.map(({ id, position }) => ({ id, position })),
      )
    } catch {
      await load()
      setError('排序保存失败，已恢复服务端顺序。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="入口排序"
        description="拖动入口调整用户端展示顺序；每次放下会立即保存。"
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
      <Card className="site-order-panel">
        <div className="site-order-toolbar">
          <Typography.Text type="secondary">
            共 {sites.length} 个入口，包含已停用入口
          </Typography.Text>
          <Typography.Text type="secondary" aria-live="polite">
            {saving ? '正在保存排序…' : '拖动卡片即可排序'}
          </Typography.Text>
        </div>
        {loading ? (
          <div className="site-order-loading">
            <Spin />
          </div>
        ) : sites.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => void handleDragEnd(event)}
            accessibility={{
              screenReaderInstructions: {
                draggable:
                  '按空格键拾取入口，使用方向键调整位置，再按空格键放下。',
              },
            }}
          >
            <SortableContext
              items={sites.map((site) => site.id)}
              strategy={rectSortingStrategy}
            >
              <div className="site-order-grid" aria-label="可排序的网站入口">
                {sites.map((site) => (
                  <SortableSiteCard
                    key={site.id}
                    site={site}
                    disabled={saving}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <Empty description="暂无可排序的网站入口" />
        )}
      </Card>
    </>
  )
}
