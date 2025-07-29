import React, { ReactElement, cloneElement } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import ModalHeader from './components/modal-header'

type modalProps = {
  show: boolean
  title?: string
  children: ReactElement
  closeHandler: () => void
  className?: string
  size?: 'small' | 'large'
}

const blk = 'modal'

const Modal = ({ show, title, children, size = 'small', closeHandler = () => {}, className }: modalProps) => {
  const modalClass = bemClass([blk, {}, className])

  if (!show) {
    return null
  }

  return (
    <div className={modalClass}>
      <div className={bemClass([blk, 'content', { [size]: !!size }])}>
        {title && (
          <ModalHeader
            title={title}
            closeHandler={closeHandler}
          />
        )}
        {children}
      </div>
    </div>
  )
}

export default Modal
