import { FunctionComponent, useState } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Table, Modal, ConfirmationPopup, Button, Icon } from '@base'

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
}

const EntityGrid: FunctionComponent<EntityGridProps> = ({ columns, data, isLoading = false, deleteHandler, editRoute, routeParams = {} }) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'delete' | 'update'>('delete')
  const [itemIdToDelete, setItemIdToDelete] = useState('')

  const enhancedColumns = [...columns]
  if (deleteHandler || editRoute) {
    enhancedColumns.push({
      label: 'Action',
      className: bemClass([blk, 'table-action']),
      custom: ({ _id }: { _id: string }) => (
        <div className={bemClass([blk, 'action-buttons'])}>
          {editRoute && (
            <Button
              asLink
              href={`${editRoute}/${_id}/edit`}
              size="small"
              className={bemClass([blk, 'first-button'])}
            >
              <Icon
                name="pencil"
                color="white"
              />
            </Button>
          )}
          {deleteHandler && (
            <Button
              category="error"
              size="small"
              clickHandler={() => {
                setItemIdToDelete(_id)
                setConfirmationPopUpType('delete')
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
      ),
    })
  }

  const handleDelete = async (id: string) => {
    if (deleteHandler) {
      try {
        await deleteHandler(id)
        setItemIdToDelete('')
        setConfirmationPopUpType('update')
        setShowConfirmationModal(true)
      } catch (error) {
        console.error('Error deleting item:', error)
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
            type={confirmationPopUpType}
            title={confirmationPopUpType === 'delete' ? 'Are you sure?' : 'Success'}
            subTitle={confirmationPopUpType === 'delete' ? 'This action cannot be reversed. Please confirm.' : 'The item has been successfully deleted.'}
            confirmButtonText={confirmationPopUpType === 'delete' ? 'Yes, Delete' : 'Okay'}
            cancelHandler={
            confirmationPopUpType === 'delete'
              ? () => {
                  if (showConfirmationModal) {
                    setShowConfirmationModal(false)
                  }
                }
              : undefined
          }
            confirmHandler={confirmationPopUpType === 'delete' ? () => handleDelete(itemIdToDelete) : () => setShowConfirmationModal(false)}
          />
        </Modal>
      )}
    </>
  )
}

export default EntityGrid
