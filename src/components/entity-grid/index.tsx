import { FunctionComponent, useState } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Table, Modal, ConfirmationPopup, Button, Icon } from '@base'
import { useToast } from '@contexts/ToastContext'

const blk = 'entity-grid'

export interface EntityGridColumn {
  label: string
  map?: string
  custom?: (item: any) => React.ReactNode
  className?: string
}

export interface EntityGridProps {
  columns: EntityGridColumn[]
  data: any[]
  isLoading?: boolean
  fetchHandler?: () => void
  deleteHandler?: (id: string) => Promise<void>
  editRoute?: string
  routeParams?: Record<string, any>
  queryParams?: Record<string, any>
  canEdit?: (row: any) => boolean
  canDelete?: (row: any) => boolean
}

const EntityGrid: FunctionComponent<EntityGridProps> = ({ 
  columns, 
  data, 
  isLoading = false, 
  deleteHandler, 
  editRoute, 
  routeParams = {}, 
  canEdit, 
  canDelete 
}) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [itemIdToDelete, setItemIdToDelete] = useState('')
  const { showToast } = useToast()

  const enhancedColumns = [...columns]
  if (deleteHandler || editRoute) {
    enhancedColumns.push({
      label: 'Action',
      className: bemClass([blk, 'table-action']),
      custom: (row: any) => {
        const showEdit = editRoute && (!canEdit || canEdit(row))
        const showDelete = deleteHandler && (!canDelete || canDelete(row))
        
        return (
          <div className={bemClass([blk, 'action-buttons'])}>
            {showEdit && (
              <Button
                asLink
                href={`${editRoute}/${row._id}/edit`}
                size="small"
                className={bemClass([blk, 'first-button'])}
              >
                <Icon
                  name="pencil"
                  color="white"
                />
              </Button>
            )}
            {showDelete && (
              <Button
                category="error"
                size="small"
                clickHandler={() => {
                  setItemIdToDelete(row._id)
                  setTimeout(() => {
                    setShowConfirmationModal(true)
                  }, 100)
                }}
              >
                <Icon
                  name="trash"
                  color="white"
                />
              </Button>
            )}
          </div>
        )
      },
    })
  }

  const handleDelete = async (id: string) => {
    if (deleteHandler) {
      try {
        await deleteHandler(id)
        setItemIdToDelete('')
        showToast('Item deleted successfully', 'success')
        setShowConfirmationModal(false)
      } catch (error) {
        console.error('Error deleting item:', error)
        showToast('Failed to delete item', 'error')
        setShowConfirmationModal(false)
      }
    }
  }

  return (
    <>
      <div className={bemClass([blk])}>
        <div className={bemClass([blk, 'content'])}>
          <Table
            columns={enhancedColumns}
            data={data}
            hoverEffect
            isLoading={isLoading}
          />
        </div>
      </div>

      {deleteHandler && (
        <Modal
          show={showConfirmationModal}
          closeHandler={() => setShowConfirmationModal(false)}
        >
          <ConfirmationPopup
            type={"delete"}
            title={'Are you sure?'}
            subTitle={'This action cannot be reversed. Please confirm.'}
            confirmButtonText={'Yes, Delete'}
            cancelHandler={() => {
              if (showConfirmationModal) {
                setShowConfirmationModal(false)
              }
            }}
            confirmHandler={() => handleDelete(itemIdToDelete)}
          />
        </Modal>
      )}
    </>
  )
}

export default EntityGrid
