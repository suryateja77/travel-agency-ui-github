import { FunctionComponent } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Text, Breadcrumb, Button } from '@base'

const blk = 'page-header'

export interface BreadcrumbItem {
  label: string
  route?: string
}

export interface PageHeaderProps {
  title: string
  total?: number
  btnRoute?: string
  btnLabel?: string
  withBreadCrumb?: boolean
  breadCrumbData?: BreadcrumbItem[]
}

const PageHeader: FunctionComponent<PageHeaderProps> = ({ title, total, btnRoute, btnLabel, withBreadCrumb = false, breadCrumbData = [] }) => {
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'content'])}>
        <div className={bemClass([blk, 'title-section'])}>
          <Text
            color="gray-darker"
            typography="l"
          >
            {title}
          </Text>
          {withBreadCrumb && breadCrumbData.length > 0 && (
            <div className={bemClass([blk, 'breadcrumb-section'])}>
              <Breadcrumb data={breadCrumbData} />
            </div>
          )}
        </div>
        <div className={bemClass([blk, 'action-section'])}>
          {total !== undefined ? `Total: ${total}` : ''}
          {btnRoute && btnLabel && (
            <Button
              category="primary"
              size="medium"
              asLink
              href={btnRoute}
            >
              {btnLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageHeader
