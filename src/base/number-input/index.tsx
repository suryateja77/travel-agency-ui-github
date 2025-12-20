import React from 'react'

import { bemClass } from '@utils'

import './style.scss'
import Text from '@base/text'

const blk = 'number-input'

interface InputEvent {
  target: {
    value: string
  }
}

interface ChangeArg {
  [arg: string]: number
}

interface NumberInputProps {
  label?: string
  disabled?: boolean
  size?: 'small' | 'large'
  placeholder?: string
  invalid?: boolean
  valid?: boolean
  rounded?: boolean
  required?: boolean
  value?: number | string
  name?: string
  className?: string
  controlClasses?: string
  errorMessage?: string
  changeHandler?: (arg: ChangeArg) => void
  onBlur?: () => void
  min?: number
  max?: number
  attributes?: {
    maxLength?: number
  }
  autoComplete?: string
}

const NumberInput = (props: NumberInputProps) => {
  const {
    label = '',
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
    min,
    max,
    attributes = {},
    autoComplete,
  } = props

  const handleInputChange = ({ target: { value } }: InputEvent) => {
    // Allow empty string for clearing the field
    if (value === '') {
      changeHandler({ [name]: 0 })
      return
    }

    // Parse as number
    const numValue = Number(value)

    // Only allow valid numbers
    if (!isNaN(numValue)) {
      changeHandler({ [name]: numValue })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'Tab' ||
      e.key === 'Escape' ||
      e.key === 'Enter' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      return
    }

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) {
      return
    }

    // Allow: minus sign only at the start
    if (e.key === '-' && (e.target as HTMLInputElement).selectionStart === 0) {
      return
    }

    // Allow: decimal point (only one)
    if (e.key === '.' && !(e.target as HTMLInputElement).value.includes('.')) {
      return
    }

    // Prevent non-numeric input
    if (!/^\d$/.test(e.key)) {
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
        type="text"
        inputMode="numeric"
        className={textFieldClass}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        min={min}
        max={max}
        {...attributes}
        autoComplete={autoComplete || 'off'}
      />
      <div className={iconClass}>
        {invalid && <i className="fa fa-exclamation-triangle" />}
        {valid && <i className="fa fa-check" />}
      </div>
    </div>
  )
}

export default NumberInput
