import React, { FunctionComponent, useState } from 'react'
import Text from '@base/text'

import { bemClass, computeValue } from '@utils'

import './style.scss'
import Spinner from '@base/spinner'

type SelectOption = {
  key: string
  value: string
}

interface InputEvent {
  target: {
    value: string | number
  }
}

interface ChangeArg {
  [arg: string]: string | number
}

interface SelectInputProps {
  label?: string
  options?: Array<SelectOption>
  name?: string
  value?: string
  size?: 'small' | 'large'
  invalid?: boolean
  valid?: boolean
  rounded?: boolean
  required?: boolean
  placeHolder?: string
  disabled?: boolean
  isLoading?: boolean
  hideLabel?: boolean
  className?: string
  controlClasses?: string
  errorMessage?: string
  changeHandler?: (arg: ChangeArg) => void
}

const blk = 'select-input'

const SelectInput: FunctionComponent<SelectInputProps> = ({
  label = '',
  options = [
    { key: '1', value: 'one' },
    { key: '2', value: 'two' },
  ],
  value = '',
  name = '',
  valid = false,
  invalid = false,
  rounded = false,
  placeHolder = 'Select',
  disabled = false,
  size = '',
  required = false,
  isLoading = false,
  hideLabel = false,
  className = '',
  controlClasses = '',
  errorMessage = '',
  changeHandler = () => {},
}) => {
  const eltClass = bemClass([
    blk,
    {
      disabled: disabled,
    },
    className,
  ])

  const handleChange = ({ target: { value } }: InputEvent) => {
    changeHandler({ [name]: value })
  }

  const selectBoxClass = bemClass([
    blk,
    'select',
    {
      validity: !(invalid || valid),
      disabled: disabled,
      invalid: invalid,
      valid: valid,
      rounded,
      [size]: size,
    },
    controlClasses,
  ])
  return (
    <div className={eltClass}>
      {isLoading && (
        <Spinner
          size="small"
          className={bemClass([blk, 'spinner'])}
        />
      )}
      <div className={bemClass([blk, 'label-container'])}>
        {!label ||
          (!hideLabel && (
            <label className={bemClass([blk, 'label'])}>
              {label}
              {required && <span className={bemClass([blk, 'star'])}>*</span>}
            </label>
          ))}
        <Text color="error">{errorMessage}</Text>
      </div>
      <select
        className={selectBoxClass}
        value={value}
        disabled={disabled}
        required={required}
        onChange={handleChange}
      >
        {placeHolder && <option value="">{placeHolder}</option>}
        {options.map((item, index) => {
          return (
            <option
              key={index}
              value={item.value}
            >
              {item.value}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default SelectInput
