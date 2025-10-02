import { FunctionComponent } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import Button from '@base/button'

const blk = 'pagination'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: FunctionComponent<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generate 5 page buttons centered around current page
  const getPageNumbers = () => {
    const pages: number[] = []
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'content'])}>
        {/* Previous button */}
        <Button
          size="small"
          category="primary"
          clickHandler={() => {
            console.log('Previous button clicked')
            onPageChange(currentPage - 1)
          }}
          className={bemClass([blk, 'button'])}
        >
          Previous
        </Button>

        {/* Page numbers */}
        <div className={bemClass([blk, 'pages'])}>
          {pageNumbers.map((page) => (
            <Button
              key={page}
              size="small"
              category={page === currentPage ? 'primary-outline' : 'primary'}
              clickHandler={() => {
                console.log(`Page ${page} button clicked`)
                onPageChange(page)
              }}
              className={bemClass([blk, 'page-button'])}
            >
              {page}
            </Button>
          ))}
        </div>

        {/* Next button */}
        <Button
          size="small"
          category="primary"
          clickHandler={() => {
            console.log('Next button clicked')
            onPageChange(currentPage + 1)
          }}
          className={bemClass([blk, 'button'])}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Pagination
