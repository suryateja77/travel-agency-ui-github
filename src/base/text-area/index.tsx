import React, { FunctionComponent } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import Text from '@base/text'

const blk = 'text-area'
interface InputEvent {
  target: {
    value: string | number
  }
}

interface ChangeArg {
  [arg: string]: string | number
}

interface TextAreaProps {
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
  attributes?: {
    maxLength: number
  }
}

const TextArea: FunctionComponent<TextAreaProps> = (props: TextAreaProps) => {
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
    attributes = {},
  } = props

  const handleInputChange = ({ target: { value } }: InputEvent) => {
    changeHandler({ [name]: value })
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

      <textarea
        className={textFieldClass}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        {...attributes}
      />
      <div className={iconClass}>
        {invalid && <i className="fa fa-exclamation-triangle" />}
        {valid && <i className="fa fa-check" />}
      </div>
    </div>
  )
}

export default TextArea
