import React, { FunctionComponent } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import Text from '@base/text'

interface ModalHeaderProps {
  title: string
  closeHandler: () => void
}

const blk = 'modal-header'

const ModalHeader: FunctionComponent<ModalHeaderProps> = ({ title, closeHandler }) => {
  return (
    <div className={bemClass([blk])}>
      <Text typography='m'>{title}</Text>
      <span
        className={bemClass([blk, 'close-button'])}
        onClick={closeHandler}
      >
        &times;
      </span>
    </div>
  )
}

export default ModalHeader
