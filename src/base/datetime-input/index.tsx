import React, { FunctionComponent, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { bemClass } from '@utils'
import Text from '@base/text'
import Icon from '@base/icon'
import Button from '@base/button'

import './style.scss'

const blk = 'datetime-input'

interface ChangeArg {
  [arg: string]: Date | null
}

interface DateTimeInputProps {
  label?: string
  type?: 'date' | 'datetime-local'
  disabled?: boolean
  size?: 'small' | 'large'
  placeholder?: string
  invalid?: boolean
  valid?: boolean
  rounded?: boolean
  required?: boolean
  value?: Date | string | null
  name?: string
  className?: string
  controlClasses?: string
  errorMessage?: string
  changeHandler?: (arg: ChangeArg) => void
  onBlur?: () => void
  min?: Date | string
  max?: Date | string
  autoComplete?: string
  showTimeSelect?: boolean
  timeFormat?: string
  dateFormat?: string
  hideLabel?: boolean
}

/**
 * DateTimeInput Component
 * 
 * A reusable component for date and datetime input fields with Save/Cancel functionality.
 * Uses react-datepicker library for consistent UI across the application.
 * 
 * @param type - 'date' or 'datetime-local' (default: 'datetime-local')
 * @param value - Date object, ISO string, or null
 * @param changeHandler - Callback that receives Date object or null
 * @param min - Minimum allowed date (Date object or ISO string)
 * @param max - Maximum allowed date (Date object or ISO string)
 * @param disabled - Disables the input field
 * @param invalid - Shows validation error state
 * @param errorMessage - Error message to display
 * @param required - Marks field as required with asterisk
 */
const DateTimeInput: FunctionComponent<DateTimeInputProps> = (props) => {
  const {
    label = '',
    type = 'datetime-local',
    disabled = false,
    size = '',
    placeholder,
    valid = false,
    invalid = false,
    rounded = false,
    required = false,
    value = null,
    name = '',
    className = '',
    errorMessage = '',
    controlClasses = '',
    changeHandler = () => {},
    onBlur,
    min,
    max,
    showTimeSelect,
    timeFormat = 'HH:mm',
    dateFormat,
    hideLabel = false,
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [tempDate, setTempDate] = useState<Date | null>(null)

  // Convert value to Date object if it's a string
  const currentValue = value ? (typeof value === 'string' ? new Date(value) : value) : null
  const minDate = min ? (typeof min === 'string' ? new Date(min) : min) : undefined
  const maxDate = max ? (typeof max === 'string' ? new Date(max) : max) : undefined

  // Determine if time selection should be enabled
  // Priority: showTimeSelect prop > type prop
  const enableTimeSelect = showTimeSelect !== undefined ? showTimeSelect : type === 'datetime-local'
  const finalDateFormat = dateFormat || (enableTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy')
  const finalPlaceholder = placeholder || (enableTimeSelect ? 'Select date and time' : 'Select date')

  const handleCalendarOpen = () => {
    setTempDate(currentValue)
    setIsOpen(true)
  }

  const handleCalendarClose = () => {
    setIsOpen(false)
    setTempDate(null)
  }

  const handleDateChange = (date: Date | null) => {
    setTempDate(date)
  }

  const handleSave = () => {
    changeHandler({ [name]: tempDate })
    handleCalendarClose()
    if (onBlur) onBlur()
  }

  const handleCancel = () => {
    handleCalendarClose()
  }

  const eltClass = bemClass([
    blk,
    {
      disabled: disabled,
    },
    className,
  ])

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

  const calendarIconClass = bemClass([blk, 'calendar-icon'])

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
          selected={tempDate !== null ? tempDate : currentValue}
          onChange={handleDateChange}
          onInputClick={handleCalendarOpen}
          onClickOutside={handleCancel}
          open={isOpen}
          showTimeSelect={enableTimeSelect}
          timeFormat={timeFormat}
          timeIntervals={15}
          dateFormat={finalDateFormat}
          placeholderText={finalPlaceholder}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          className={inputClass}
          calendarClassName={bemClass([blk, 'calendar'])}
          popperClassName={bemClass([blk, 'popper'])}
          popperPlacement="bottom-start"
          autoComplete="off"
        >
          <div className={bemClass([blk, 'calendar-footer'])}>
            <Button
              size="small"
              category="default"
              clickHandler={handleCancel}
              className={bemClass([blk, 'calendar-button'])}
            >
              Cancel
            </Button>
            <Button
              size="small"
              category="primary"
              clickHandler={handleSave}
              className={bemClass([blk, 'calendar-button'])}
            >
              Save
            </Button>
          </div>
        </DatePicker>

        <div className={calendarIconClass} onClick={() => !disabled && handleCalendarOpen()}>
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

export default DateTimeInput
