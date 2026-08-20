import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Tag } from 'antd'
import { useState } from 'react'
import type { PublicSite } from '../../api'

function domain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function SiteIcon({ site }: { site: PublicSite }) {
  const [failed, setFailed] = useState(false)
  if (site.iconUrl && !failed) {
    return (
      <img
        className="site-order-icon"
        src={site.iconUrl}
        alt=""
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span
      className="site-order-icon site-order-icon-fallback"
      style={{ background: site.fallbackColor }}
    >
      {site.fallbackIcon || site.name.slice(0, 1)}
    </span>
  )
}

export function SortableSiteCard({
  site,
  disabled,
}: {
  site: PublicSite
  disabled: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: site.id, disabled })

  return (
    <article
      ref={setNodeRef}
      className={`site-order-card${isDragging ? ' is-dragging' : ''}${!site.enabled ? ' is-disabled' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <SiteIcon site={site} />
      <strong title={site.name}>{site.name}</strong>
      <small title={domain(site.url)}>{domain(site.url)}</small>
      {!site.enabled && <Tag color="default">已停用</Tag>}
    </article>
  )
}
