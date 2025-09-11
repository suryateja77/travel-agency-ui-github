import React, { ChangeEvent, ChangeEventHandler, FunctionComponent } from 'react'

import './style.scss'
import { bemClass, pathToName } from '@utils'

const blk = 'radio-input'

interface RadioInputProps {
  id: string
  name: string
  label: string
  value: string
  disabled?: boolean
  option: { key: string; value: string }
  changeHandler: (obj: Record<string, string>) => void
}

const RadioInput: FunctionComponent<RadioInputProps> = ({ name, label, id, value, disabled, changeHandler, option }) => {
  const onClickHandler: ChangeEventHandler<HTMLInputElement> = () => {
    const valueObj = { [name]: option.value }
    changeHandler(valueObj)
  }
  return (
    <div className={bemClass([blk])}>
      <input
        type="radio"
        name={name}
        id={option.key}
        disabled={disabled}
        checked={value === option.value}
        className={bemClass([blk, 'input'])}
        onChange={onClickHandler}
      />
      <label
        className={bemClass([blk, 'label'])}
        htmlFor={option.key}
      >
        {pathToName(label)}
      </label>
    </div>
  )
}

export default RadioInput
