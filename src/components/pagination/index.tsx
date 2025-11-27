import { FunctionComponent } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import { SelectInput, Icon, Text } from '@base'

const blk = 'pagination'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalEntries: number
  entriesPerPage: number
  onPageChange: (page: number) => void
  onEntriesPerPageChange: (entriesPerPage: number) => void
}

const Pagination: FunctionComponent<PaginationProps> = ({ currentPage, totalPages, totalEntries, entriesPerPage, onPageChange, onEntriesPerPageChange }) => {
  // Calculate current entries range
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries)

  // Entries per page options
  const entriesPerPageOptions = [
    { key: '5', value: '5' },
    { key: '10', value: '10' },
    { key: '20', value: '20' },
    { key: '50', value: '50' },
  ]

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handleEntriesPerPageChange = (value: any) => {
    const newEntriesPerPage = parseInt(value.entriesPerPage)
    if (!isNaN(newEntriesPerPage)) {
      onEntriesPerPageChange(newEntriesPerPage)
      // Reset to first page when changing entries per page
      onPageChange(1)
    }
  }

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'content'])}>
        <SelectInput
          name="entriesPerPage"
          options={entriesPerPageOptions}
          value={entriesPerPage.toString()}
          changeHandler={handleEntriesPerPageChange}
          showPlaceholder={false}
        />

        {/* Navigation controls */}
        <div className={bemClass([blk, 'navigation'])}>
          {/* Previous button */}
          <button
            className={bemClass([blk, 'nav-button', currentPage === 1 ? ['disabled'] : []])}
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <Icon name="chevron-left" />
          </button>

          {/* Page info */}
          <div className={bemClass([blk, 'info'])}>
            <Text
              typography="xs"
              fontWeight="semi-bold"
              color="gray-dark"
            >
              {`${startEntry}-${endEntry} of ${totalEntries}`}
            </Text>
          </div>

          {/* Next button */}
          <button
            className={bemClass([blk, 'nav-button', currentPage >= totalPages ? ['disabled'] : []])}
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <Icon name="chevron-right" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
