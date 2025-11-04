import { FunctionComponent } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Text, Breadcrumb, Button, Icon } from '@base'

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
  exportButtonsToShow?: {
    csv: boolean
    pdf: boolean
    excel: boolean
  }
  onExportExcel?: () => void
  onExportCsv?: () => void
  onExportPdf?: () => void
}

const PageHeader: FunctionComponent<PageHeaderProps> = ({ title, total, btnRoute, btnLabel, withBreadCrumb = false, breadCrumbData = [], exportButtonsToShow = { csv: false, pdf: false, excel: false }, onExportExcel, onExportCsv, onExportPdf }) => {
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
          {exportButtonsToShow.excel && (
            <Button
              category="success"
              size="medium"
              clickHandler={onExportExcel || (() => {})}
            >
              <Icon name="file-excel-o" size="14" className={bemClass([blk, 'icon-margin'])} />
              Export to Excel
            </Button>
          )}
          {exportButtonsToShow.csv && (
            <Button
              category="info"
              size="medium"
              clickHandler={onExportCsv || (() => {})}
            >
              <Icon name="file-text-o" size="14" className={bemClass([blk, 'icon-margin'])} />
              Export to CSV
            </Button>
          )}
          {exportButtonsToShow.pdf && (
            <Button
              category="error"
              size="medium"
              clickHandler={onExportPdf || (() => {})}
            >
              <Icon name="file-pdf-o" size="14" className={bemClass([blk, 'icon-margin'])} />
              Export to PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageHeader
