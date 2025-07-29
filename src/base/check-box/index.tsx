import React, { ChangeEvent, ChangeEventHandler } from 'react'

import { bemClass } from '@utils'

import './style.scss'

type checkboxProps = {
  id: string
  label: string
  checked?: boolean
  changeHandler: (obj: Record<string, boolean>) => void
  className?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const blk = 'check-box'

const CheckBox = ({ id, label, checked = false, changeHandler, className, disabled = false, size = 'medium' }: checkboxProps) => {
  const onClickHandler: ChangeEventHandler<HTMLInputElement> = (event: ChangeEvent) => {
    const isChecked = (event.target as HTMLInputElement).checked
    const valueObj = { [id]: isChecked }

    changeHandler(valueObj)
  }

  return (
    <div className={bemClass([blk, {}, className])}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        className={bemClass([blk, 'control'])}
        onChange={onClickHandler}
      />
      <label
        htmlFor={id}
        className={bemClass([blk, 'label', { [size]: !!size }])}
      >
        {label}
      </label>
    </div>
  )
}

export default CheckBox
