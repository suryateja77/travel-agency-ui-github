import React, { FunctionComponent, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { bemClass } from '@utils'
import Text from '@base/text'
import Icon from '@base/icon'

import './style.scss'

interface ChangeArg {
  [arg: string]: string | number | Date | null
}

interface DatePickerProps {
  label?: string
  name?: string
  value?: Date | null
  size?: 'small' | 'large'
  invalid?: boolean
  valid?: boolean
  rounded?: boolean
  required?: boolean
  placeholder?: string
  disabled?: boolean
  hideLabel?: boolean
  className?: string
  controlClasses?: string
  errorMessage?: string
  showTimeSelect?: boolean
  timeFormat?: string
  dateFormat?: string
  changeHandler?: (arg: ChangeArg) => void
}

const blk = 'date-picker'

const DatePickerInput: FunctionComponent<DatePickerProps> = ({
  label = '',
  name = '',
  value = null,
  size = '',
  invalid = false,
  valid = false,
  rounded = false,
  required = false,
  placeholder = 'Select date',
  disabled = false,
  hideLabel = false,
  className = '',
  controlClasses = '',
  errorMessage = '',
  showTimeSelect = true,
  timeFormat = 'HH:mm',
  dateFormat = showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy',
  changeHandler = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const eltClass = bemClass([
    blk,
    {
      disabled: disabled,
    },
    className,
  ])

  const handleChange = (date: Date | null) => {
    changeHandler({ [name]: date })
  }

  const inputClass = bemClass([
    blk,
    'input',
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

  const calendarIconClass = bemClass([
    blk,
    'calendar-icon',
  ])

  return (
    <div className={eltClass}>
      <div className={bemClass([blk, 'label-container'])}>
        {label && !hideLabel && (
          <label className={bemClass([blk, 'label'])}>
            {label}
            {required && <span className={bemClass([blk, 'star'])}>*</span>}
          </label>
        )}
        <Text color="error">{errorMessage}</Text>
      </div>
      
      <div className={bemClass([blk, 'input-wrapper'])}>
        <DatePicker
          selected={value}
          onChange={handleChange}
          onInputClick={() => setIsOpen(true)}
          onClickOutside={() => setIsOpen(false)}
          open={isOpen}
          showTimeSelect={showTimeSelect}
          timeFormat={timeFormat}
          timeIntervals={15}
          dateFormat={dateFormat}
          placeholderText={placeholder}
          disabled={disabled}
          className={inputClass}
          calendarClassName={bemClass([blk, 'calendar'])}
          popperClassName={bemClass([blk, 'popper'])}
          popperPlacement="bottom-start"
          autoComplete="off"
        />
        
        <div className={calendarIconClass} onClick={() => !disabled && setIsOpen(!isOpen)}>
          <Icon name="calendar" />
        </div>
        
        <div className={iconClass}>
          {invalid && <Icon name="exclamation-triangle" />}
          {valid && <Icon name="check" />}
        </div>
      </div>
    </div>
  )
}

export default DatePickerInput
