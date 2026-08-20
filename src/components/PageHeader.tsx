import { Button, Space, Typography } from 'antd'
import { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  extra,
}: {
  title: string
  description: string
  extra?: ReactNode
}) {
  return (
    <header className="page-header">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>{title}</Typography.Title>
          <Typography.Paragraph type="secondary">
            {description}
          </Typography.Paragraph>
        </div>
        {extra && <Space>{extra}</Space>}
      </div>
    </header>
  )
}
export const DemoBadge = () => (
  <Button size="small" type="text" className="demo-badge">
    演示数据
  </Button>
)
