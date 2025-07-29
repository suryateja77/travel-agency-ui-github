import React, { ChangeEvent, ChangeEventHandler, FunctionComponent } from 'react'

import './style.scss'
import { bemClass } from '@utils'

const blk = 'radio-input'

interface RadioInputProps {
  id: string
  name: string
  label: string
  value: string
  disabled?: boolean
  changeHandler: (obj: Record<string, string>) => void
}

const RadioInput: FunctionComponent<RadioInputProps> = ({ name, label, id, value, disabled, changeHandler }) => {
  const onClickHandler: ChangeEventHandler<HTMLInputElement> = () => {
    const valueObj = { [name]: id }
    changeHandler(valueObj)
  }
  return (
    <div className={bemClass([blk])}>
      <input
        type="radio"
        name={name}
        id={id}
        disabled={disabled}
        checked={value === id}
        className={bemClass([blk, 'input'])}
        onChange={onClickHandler}
      />
      <label
        className={bemClass([blk, 'label'])}
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  )
}

export default RadioInput
