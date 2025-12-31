import React, { FunctionComponent, useState } from 'react'
import Button from '@base/button'
import Text from '@base/text'
import { bemClass, validatePayload } from '@utils'

import './style.scss'
import Modal from '@base/modal'
import TextInput from '@base/text-input'
import TextArea from '@base/text-area'
import Table from '@base/table'
import Icon from '@base/icon'
import ConfirmationPopup from '@base/confirmation-popup'
import Toggle from '@base/toggle'
import { useUpdateConfigurationMutation } from '@api/queries/configuration'
import { validationSchema } from './validation'
import Alert from '@base/alert'

interface ConfigItem {
  name: string
  comment: string
  id?: number
  disabled?: boolean
}

interface SettingPanelProps {
  title: string
  className?: string
  config: Array<ConfigItem>
  configId: string
}

const blk = 'settings-panel'

const SettingPanel: FunctionComponent<SettingPanelProps> = ({ title, className, config, configId }) => {
  const { mutateAsync: updateConfigurationById } = useUpdateConfigurationMutation()
  const configModal = {
    configItemName: '',
    configItemComment: '',
    configItemDisabled: false,
  }
  const [configData, setConfigData] = useState(config)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create')
  const [activeConfigComment, setActiveConfigComment] = useState('')
  const [activeConfigName, setActiveConfigName] = useState('')
  const [activeConfigItemId, setActiveConfigItemId] = useState(0)
  const [activeConfigDisabled, setActiveConfigDisabled] = useState(false)
  const [errorMap, setErrorMap] = useState<Record<string, string>>({
    configItemName: '',
    configItemComment: '',
  })
  const [isValidationError, setIsValidationError] = useState(false)

  const [confirmationPopupType, setConfirmationPopupType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopupTitle, setConfirmationPopupTitle] = useState('Success')
  const [confirmationPopupSubTitle, setConfirmationPopupSubTitle] = useState('Configuration added successfully')
  const [confirmButtonText, setConfirmButtonText] = useState('Okay')

  const columns = [
    {
      label: 'name',
      map: 'name',
    },
    {
      label: 'Comment',
      map: 'comment',
    },
    {
      label: 'Action',
      className: bemClass([blk, 'table-action']),
      custom: ({ name, comment, id, disabled }: { comment: string; name: string; id: number; disabled?: boolean }) => (
        <>
          <Button
            size="small"
            className={bemClass([blk, 'first-button'])}
            clickHandler={() => {
              handleEditConfigItem(name, comment, id, disabled)
            }}
            disabled={disabled}
          >
            <Icon
              name="pencil"
              color="white"
            />
          </Button>
          <Button
            category="error"
            size="small"
            clickHandler={() => {
              if (id) {
                setActiveConfigItemId(id)
              }
              setTimeout(() => {
                handleConfirmationPopUp('delete', 'Are you sure?', 'This action cannot be undone and will delete the record')
              }, 200)
            }}
            disabled={disabled}
          >
            <Icon
              name="trash"
              color="white"
            />
          </Button>
        </>
      ),
    },
  ]

  const handleAddConfigItem = () => {
    setModalMode('create')
    setActiveConfigComment('')
    setActiveConfigName('')
    setActiveConfigDisabled(false)
    setActiveConfigItemId(0)
    if (!showAddModal) {
      setShowAddModal(true)
    }
  }

  const handleEditConfigItem = (configItemName: string, configItemComment: string, id: number, disabled?: boolean) => {
    setModalMode('update')
    setActiveConfigComment(configItemComment)
    setActiveConfigName(configItemName)
    setActiveConfigDisabled(disabled || false)
    setActiveConfigItemId(id)
    setTimeout(() => {
      if (!showAddModal) {
        setShowAddModal(true)
      }
    }, 500)
  }

  const handleConfirmationPopUp = (type: 'create' | 'update' | 'delete', title: string, subTitle: string, id?: number) => {
    setConfirmationPopupType(type)
    setConfirmationPopupTitle(title)
    setConfirmationPopupSubTitle(subTitle)
    setConfirmButtonText(type === 'delete' ? 'Yes, Delete' : 'Okay')
    setTimeout(() => {
      if (!showConfirmationPopup) {
        setShowConfirmationPopup(true)
      }
    }, 500)
  }

  const updateItems = (type: 'update' | 'delete' = 'update') => {
    if (type === 'update') {
      return configData.map(item => (item.id === activeConfigItemId ? { ...item, name: activeConfigName, comment: activeConfigComment, disabled: activeConfigDisabled } : item))
    } else {
      return configData.filter(item => item.id !== activeConfigItemId)
    }
  }

  const removeIdsToConfigItems = (data: Array<ConfigItem>) => {
    return data.map((configItem: ConfigItem, index) => {
      return { name: configItem.name, comment: configItem.comment, disabled: configItem.disabled }
    })
  }

  const closeConfirmationPopUp = () => {
    setActiveConfigItemId(0)
    if (showConfirmationPopup) {
      setShowConfirmationPopup(false)
    }
  }

  const deleteConfiguration = async () => {
    try {
      const updatedConfigItems = updateItems('delete')
      await updateConfigurationById({ _id: configId, configurationItems: removeIdsToConfigItems(updatedConfigItems) })
      setConfigData(updatedConfigItems)
      setActiveConfigComment('')
      setActiveConfigName('')
      setActiveConfigItemId(0)
      handleConfirmationPopUp('update', 'Success', `The configuration has been deleted`)
    } catch (error) {
      console.log('Unable to delete configuration', error)
    }
  }

  const saveConfigItem = async () => {
    const { isValid, errorMap } = validatePayload(validationSchema, { ...configModal, configItemName: activeConfigName, configItemComment: activeConfigComment })
    setErrorMap(errorMap)
    if (isValid) {
      try {
        const updatedConfigItems = modalMode === 'update' ? updateItems() : [...configData, { name: activeConfigName, comment: activeConfigComment, disabled: activeConfigDisabled, id: configData.length }]
        await updateConfigurationById({ _id: configId, configurationItems: removeIdsToConfigItems(updatedConfigItems) })
        setConfigData(updatedConfigItems)
        setIsValidationError(false)
        setActiveConfigComment('')
        setActiveConfigName('')
        setActiveConfigItemId(0)
        if (showAddModal) {
          setShowAddModal(false)
        }
        handleConfirmationPopUp(modalMode, 'Success', `The configuration has been ${modalMode === 'create' ? 'added' : 'updated'}`)
      } catch (error) {
        console.log('Unable to add/edit configuration item', error)
      }
    } else {
      setIsValidationError(true)
    }
  }

  return (
    <>
      <div className={bemClass([blk, {}, className])}>
        <div className={bemClass([blk, 'header'])}>
          <Text
            tag="div"
            typography="m"
          >
            {title}
          </Text>
          <Button
            category="primary"
            size="medium"
            clickHandler={handleAddConfigItem}
          >
            + Add
          </Button>
        </div>
        <Table
          columns={columns}
          data={configData}
        />
      </div>
      <Modal
        show={showAddModal}
        closeHandler={() => {
          if (showAddModal) {
            setShowAddModal(false)
          }
        }}
      >
        <div className={bemClass([blk, 'modal-content'])}>
          <div className={bemClass([blk, 'modal-header'])}>
            <Text
              tag="p"
              typography="l"
              className={bemClass([blk, 'modal-title'])}
            >
              {title}
            </Text>
            <Toggle
              name="configItemDisabled"
              label="Disable"
              checked={activeConfigDisabled}
              changeHandler={(value) => {
                setActiveConfigDisabled(value.configItemDisabled)
              }}
            />
          </div>
          {isValidationError && (
            <Alert
              type="error"
              message="Please fill out the required fields"
              className={bemClass([blk, 'margin-bottom'])}
            />
          )}
          <TextInput
            label="Name"
            placeholder="Name"
            name="configItemName"
            invalid={!!errorMap.configItemName}
            className={bemClass([blk, 'name-input'])}
            value={activeConfigName}
            changeHandler={value => {
              setActiveConfigName(value.configItemName.toString())
            }}
          />
          <TextArea
            value={activeConfigComment}
            changeHandler={value => {
              setActiveConfigComment(value.configItemComment.toString())
            }}
            name="configItemComment"
            label="Comment"
            placeholder="Comment"
          />
          <div className={bemClass([blk, 'modal-button-container'])}>
            <Button
              clickHandler={() => {
                if (showAddModal) {
                  setIsValidationError(false)
                  setErrorMap({
                    configItemName: '',
                    configItemComment: '',
                  })
                  setShowAddModal(false)
                }
              }}
              size="medium"
              category="default"
              className={bemClass([blk, 'modal-button'])}
            >
              Cancel
            </Button>
            <Button
              size="medium"
              className={bemClass([blk, 'modal-button'])}
              clickHandler={saveConfigItem}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        show={showConfirmationPopup}
        closeHandler={closeConfirmationPopUp}
      >
        <ConfirmationPopup
          type={confirmationPopupType}
          title={confirmationPopupTitle}
          subTitle={confirmationPopupSubTitle}
          confirmButtonText={confirmButtonText}
          confirmHandler={['create', 'update'].includes(confirmationPopupType) ? closeConfirmationPopUp : deleteConfiguration}
          cancelHandler={confirmationPopupType === 'delete' ? closeConfirmationPopUp : undefined}
        />
      </Modal>
    </>
  )
}

export default SettingPanel
