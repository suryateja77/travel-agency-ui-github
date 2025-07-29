import React, { FunctionComponent } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import Text from '@base/text'
import Button from '@base/button'

const blk = 'confirmation-popup'

interface ConfirmationPopupProps {
  type: 'delete' | 'update' | 'create'
  title: string
  subTitle: string
  cancelHandler?: () => void
  confirmHandler?: () => void
  confirmButtonText?: string
  cancelButtonText?: string
}

const ConfirmationPopup: FunctionComponent<ConfirmationPopupProps> = ({ type, title, subTitle, cancelHandler, confirmHandler, confirmButtonText = 'Okay', cancelButtonText = 'Cancel' }) => {
  return (
    <div className={bemClass([blk])}>
      <Text
        tag="p"
        typography="xxl"
        className={bemClass([blk, 'title'])}
      >
        {title}
      </Text>
      <Text
        tag="p"
        color="gray"
        className={bemClass([blk, 'subTitle'])}
      >
        {subTitle}
      </Text>
      <div className={bemClass([blk, 'button-container'])}>
        {cancelHandler && (
          <Button
            clickHandler={cancelHandler}
            size="medium"
            category="default"
            className={bemClass([blk, 'confirmation-button'])}
          >
            {cancelButtonText}
          </Button>
        )}
        {confirmHandler && (
          <Button
            clickHandler={confirmHandler}
            size="medium"
            className={bemClass([blk, 'confirmation-button'])}
            category={type === 'delete' ? 'error' : type === 'create' ? 'success' : 'primary'}
          >
            {confirmButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}

export default ConfirmationPopup
