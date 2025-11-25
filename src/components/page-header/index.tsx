import { FunctionComponent } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Text, Breadcrumb, Button } from '@base'
import ExportDropdown from '../export-dropdown'

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
  showExport?: boolean
  onExportExcel?: () => void | Promise<void>
  onExportCsv?: () => void | Promise<void>
  onExportPdf?: () => void | Promise<void>
}

const PageHeader: FunctionComponent<PageHeaderProps> = ({ title, total, btnRoute, btnLabel, withBreadCrumb = false, breadCrumbData = [], showExport = false, onExportExcel, onExportCsv, onExportPdf }) => {
  const hasAnyExportHandler = onExportExcel || onExportCsv || onExportPdf

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
          {showExport && hasAnyExportHandler && (
            <ExportDropdown
              onExportExcel={onExportExcel}
              onExportCsv={onExportCsv}
              onExportPdf={onExportPdf}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PageHeader
