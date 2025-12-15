import React from 'react'

import { bemClass } from '@utils'


import './style.scss'
import Text from '@base/text'

const blk = 'text-input'
interface InputEvent {
  target: {
    value: string | number
  }
}

interface ChangeArg {
  [arg: string]: string | number
}
interface TextInputProps {
  label?: string
  type?: string
  disabled?: boolean
  size?: 'small' | 'large'
  placeholder?: string
  invalid?: boolean
  valid?: boolean
  rounded?: boolean
  required?: boolean
  value?: string | number
  name?: string
  className?: string
  controlClasses?: string
  errorMessage?: string
  changeHandler?: (arg: ChangeArg) => void
  onBlur?: () => void
  attributes?: {
    maxLength: number
  }
  autoComplete?: string
}

const TextInput = (props: TextInputProps) => {
  const {
    label = '',
    type = 'text',
    disabled = false,
    size = '',
    placeholder = '',
    valid = false,
    invalid = false,
    rounded = false,
    required = false,
    value = '',
    name = '',
    className = '',
    errorMessage = '',
    controlClasses = '',
    changeHandler = () => {},
    onBlur,
    attributes = {},
  } = props

  const handleInputChange = ({ target: { value } }: InputEvent) => {
    const parsedValue = type === 'number' ? Number(value) : value
    changeHandler({ [name]: parsedValue })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // For datetime-local inputs, prevent all keyboard input except tab navigation
    if (type === 'datetime-local') {
      // Allow tab, shift+tab, and other navigation keys
      if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Enter' || e.key === 'Escape') {
        return
      }
      // Prevent all other key inputs
      e.preventDefault()
    }
  }

  const eltClass = bemClass([blk, {}, className])

  const textFieldClass = bemClass([
    blk,
    'textField',
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

  const iconClass = bemClass([
    blk,
    'icon',
    {
      invalid: invalid,
      valid: valid,
    },
  ])

  return (
    <div className={eltClass}>
      <div className={bemClass([blk, 'label-container'])}>
        {label && (
          <label className={bemClass([blk, 'label'])}>
            {label}
            {required && <span className={bemClass([blk, 'star'])}>*</span>}
          </label>
        )}
        <Text color="error">{errorMessage}</Text>
      </div>

      <input
        type={type}
        className={textFieldClass}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        {...attributes}
        autoComplete={props.autoComplete || 'off'}
      />
      <div className={iconClass}>
        {invalid && <i className="fa fa-exclamation-triangle" />}
        {valid && <i className="fa fa-check" />}
      </div>
    </div>
  )
}

export default TextInput
