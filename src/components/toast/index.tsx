import React, { FunctionComponent, useEffect } from 'react'
import { bemClass } from '@utils'
import { Icon } from '@base'

import './style.scss'

const blk = 'toast'

export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  show: boolean
  onClose: () => void
  duration?: number
}

const Toast: FunctionComponent<ToastProps> = ({ message, type, show, onClose, duration = 2000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const iconMap = {
    success: 'check-circle',
    error: 'exclamation-circle',
    info: 'info-circle',
    warning: 'exclamation-triangle',
  }

  return (
    <div className={bemClass([blk, 'container'])}>
      <div className={bemClass([blk, 'content', [type]])}>
        <div className={bemClass([blk, 'icon-wrapper'])}>
          <Icon name={iconMap[type]} />
        </div>
        <span className={bemClass([blk, 'message'])}>{message}</span>
        <button
          className={bemClass([blk, 'close-button'])}
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="times" />
        </button>
      </div>
    </div>
  )
}

export default Toast
