import BreadCrumb from '@base/breadcrumb'
import Text from '@base/text'
import { bemClass, validatePayload } from '@utils'
import React, { FunctionComponent, useState } from 'react'
import './style.scss'
import Alert from '@base/alert'
import Panel from '@base/panel'
import Row from '@base/row'
import Column from '@base/column'
import TextInput from '@base/text-input'
import Modal from '@base/modal'
import Button from '@base/button'
import ConfirmationPopup from '@base/confirmation-popup'
import { useNavigate } from 'react-router-dom'
import { validationSchema } from './validation'
import {useCreateConfigurationMutation} from '@api/queries/configuration'

interface CreateConfigurationProps {}

const blk = 'create-configuration'

const CreateConfiguration: FunctionComponent<CreateConfigurationProps> = () => {
  const { mutateAsync: createConfiguration } = useCreateConfigurationMutation()
  const navigate = useNavigate()
  const modal = { configTitle: '' }

  const [isValidationError, setIsValidationError] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [configTitle, setConfigTitle] = useState('')
  const [errorMap, setErrorMap] = useState<Record<string, string>>(modal)

  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New user role created successfully!')

  const navigateToConfigurations = () => {
    navigate('/settings/configurations')
  }

  const closeConfirmationPopUp = () => {
    if (showConfirmationModal) {
      setShowConfirmationModal(false)
    }
  }

  const saveNewConfiguration = async () => {
    const { isValid, errorMap } = validatePayload(validationSchema, { ...modal, configTitle })
    if (isValid) {
      try {
        await createConfiguration({ name: configTitle, configurationItems: [] })
        setConfirmationPopUpType('create')
        setConfirmationPopUpTitle('Success')
        setConfirmationPopUpSubtitle('The configuration has been created successfully!')
        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500);
        setErrorMap(errorMap)
        setIsValidationError(false)
      } catch (error) {
        console.log(error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Sorry')
        setConfirmationPopUpSubtitle('Something went wrong, please try again later.')
        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500);
      }
    } else {
      setErrorMap(errorMap)
      setIsValidationError(true)
    }
  }

  return (
    <>
      <div className={bemClass([blk])}>
        <div className={bemClass([blk, 'header'])}>
          <Text
            color="gray-darker"
            typography="l"
          >
            {'New Configuration'}
          </Text>
          <BreadCrumb
            data={[
              {
                label: 'Home',
                route: '/dashboard',
              },
              {
                label: 'Configuration',
                route: '/settings/configurations',
              },
              {
                label: 'New Configuration',
              },
            ]}
          />
        </div>
        {isValidationError && (
          <Alert
            type="error"
            message="There is an error with submission, please correct errors indicated below."
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}
        <div className={bemClass([blk, 'content'])}>
          <Panel title="Configuration Info">
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  name="configTitle"
                  label="Title"
                  placeholder="Title"
                  value={configTitle}
                  invalid={!!errorMap.configTitle}
                  changeHandler={value => {
                    setConfigTitle(value.configTitle.toString())
                  }}
                />
              </Column>
            </Row>
          </Panel>
          <div className={bemClass([blk, 'action-items'])}>
            <Button
              size="medium"
              category="default"
              className={bemClass([blk, 'margin-right'])}
              asLink
              href="/settings/configurations"
            >
              Cancel
            </Button>
            <Button
              size="medium"
              category="primary"
              clickHandler={saveNewConfiguration}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
      <Modal
        show={showConfirmationModal}
        closeHandler={() => {
          if (showConfirmationModal) {
            setShowConfirmationModal(false)
          }
        }}
      >
        <ConfirmationPopup
          type={confirmationPopUpType}
          title={confirmationPopUpTitle}
          subTitle={confirmationPopUpSubtitle}
          confirmButtonText="Okay"
          confirmHandler={['create', 'update'].includes(confirmationPopUpType) ? navigateToConfigurations : closeConfirmationPopUp}
        />
      </Modal>
    </>
  )
}

export default CreateConfiguration
