import { FunctionComponent, useState, useRef, useEffect } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Button, Icon } from '@base'

const blk = 'export-dropdown'

export interface ExportDropdownProps {
  onExportExcel?: () => void | Promise<void>
  onExportCsv?: () => void | Promise<void>
  onExportPdf?: () => void | Promise<void>
  disabled?: boolean
}

const ExportDropdown: FunctionComponent<ExportDropdownProps> = ({
  onExportExcel,
  onExportCsv,
  onExportPdf,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled && !isLoading) {
      setIsOpen(!isOpen)
    }
  }

  const handleExport = async (exportFn?: () => void | Promise<void>, type?: string) => {
    if (!exportFn) return

    setIsLoading(true)
    try {
      await exportFn()
      setIsOpen(false) // Close dropdown on successful export
    } catch (error) {
      console.error(`${type} export failed:`, error)
      // Keep dropdown open on error so user can retry
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={bemClass([blk])} ref={dropdownRef}>
      <Button
        category="primary"
        size="medium"
        clickHandler={handleToggle}
        disabled={disabled || isLoading}
        loading={isLoading}
      >
        <Icon name="download" size="14" className={bemClass([blk, 'icon'])} />
        Export
        <Icon
          name={isOpen ? 'angle-up' : 'angle-down'}
          size="14"
          className={bemClass([blk, 'icon', {right: true}])}
        />
      </Button>

      {isOpen && !isLoading && (
        <div className={bemClass([blk, 'menu'])}>
          {onExportExcel && (
            <button
              className={bemClass([blk, 'menu-item'])}
              onClick={() => handleExport(onExportExcel, 'Excel')}
            >
              <Icon name="file-excel-o" size="14" className={bemClass([blk, 'menu-icon'])} />
              Export to Excel
            </button>
          )}
          {onExportCsv && (
            <button
              className={bemClass([blk, 'menu-item'])}
              onClick={() => handleExport(onExportCsv, 'CSV')}
            >
              <Icon name="file-text-o" size="14" className={bemClass([blk, 'menu-icon'])} />
              Export to CSV
            </button>
          )}
          {onExportPdf && (
            <button
              className={bemClass([blk, 'menu-item'])}
              onClick={() => handleExport(onExportPdf, 'PDF')}
            >
              <Icon name="file-pdf-o" size="14" className={bemClass([blk, 'menu-icon'])} />
              Export to PDF
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ExportDropdown
