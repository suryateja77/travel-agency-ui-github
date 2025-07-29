import React, { FunctionComponent } from 'react'
import Button from '@base/button'
import Column from '@base/column'
import PanelComponent from '@base/panel'
import Row from '@base/row'
import Text from '@base/text'
import { Field, Panel } from '@types'
import { bemClass, chunkArray, computeValue } from '@utils'
import { useNavigate } from 'react-router-dom'
import './style.scss'

interface PageDetailProps {
  pageDataTemplate: Panel[]
  pageData: Record<string, any>
}

const blk = 'page-detail'

const renderField = (field: Field, data: Record<string, any>) => (
  <Column
    key={field.path}
    col={3}
    className={bemClass([blk, 'field'])}
  >
    <Text
      typography="xs"
      fontWeight="bold"
    >
      {field.label}
    </Text>
    <Text
      tag="p"
      typography="l"
      className={bemClass([blk, 'field-value'])}
    >
      {computeValue(data, field.path)}
    </Text>
  </Column>
)

const renderRow = (fields: Field[], data: Record<string, any>) => <Row key={fields.map(f => f.path).join('-')}>{fields.map(field => renderField(field, data))}</Row>

const renderPanelFields = (fields: Field[], data: Record<string, any>) => chunkArray(fields, 4).map(chunk => renderRow(chunk, data))

const PanelMultipleRows: FunctionComponent<{
  fields: Field[]
  rows: Record<string, any>[]
  panelKey: string
}> = ({ fields, rows, panelKey }) => (
  <>
    {rows.length === 0 ? (
      <Text tag="p" typography="m">No entries available.</Text>
    ) : (
      rows.map((rowData, idx) => (
        <div key={`${panelKey}-${idx}`} className={bemClass([blk, 'field-row'])}>
          {renderPanelFields(fields, rowData)}
        </div>
      ))
    )}
  </>
)

const PageDetail: FunctionComponent<PageDetailProps> = ({ pageDataTemplate, pageData }) => {
  const navigate = useNavigate()
  return (
    <>
      {pageDataTemplate.map(({ panel, fields, type = 'SINGLE', parentPath = '' }) => {
        const isMultiple = type === 'MULTIPLE'
        const rows = isMultiple ? pageData[parentPath] || [] : [pageData]
        return (
          <PanelComponent
            key={panel}
            title={panel}
            className={bemClass([blk, 'margin-bottom'])}
          >
            {isMultiple
              ? <PanelMultipleRows fields={fields} rows={rows} panelKey={panel} />
              : renderPanelFields(fields, pageData)}
          </PanelComponent>
        )
      })}
      <div className={bemClass([blk, 'action-items'])}>
        <Button
          size="medium"
          category="primary"
          clickHandler={() => navigate(-1)}
        >
          Back
        </Button>
      </div>
    </>
  )
}

export default PageDetail
