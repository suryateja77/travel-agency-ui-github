'use client'
import CheckboxGroup from '@base/checkbox-group'
import RadioGroup from '@base/radio-group'
import SelectInput from '@base/select-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'
import { transformConfigurations } from '@utils'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { useConfigurationsQuery } from '@api/queries/configuration'
import { Configuration } from '@types'

const blk = 'configured-input'

type Option = {
  key: string
  value: string
}

interface ChangeArg {
  [arg: string]: string | number | boolean
}

interface ConfiguredInputProps {
  type: CONFIGURED_INPUT_TYPES
  value: string
  name: string
  changeHandler: (arg: ChangeArg) => void
  configToUse: string
  label?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  invalid?: boolean
  valid?: boolean
  checkboxValue?: Array<string>
  checkboxChangeHandler?: (arg: ChangeArg) => void
}

const ConfiguredInput: FunctionComponent<ConfiguredInputProps> = ({
  type,
  value,
  label = '',
  name,
  changeHandler,
  errorMessage = '',
  configToUse,
  valid = false,
  invalid = false,
  disabled = false,
  required = false,
  checkboxValue = [],
  checkboxChangeHandler = () => {},
}) => {
  const { data: configurationsData } = useConfigurationsQuery()
  const [inputOptions, setInputOptions] = useState<Array<Option>>([
    {
      key: 'Default',
      value: 'Default',
    },
  ])

  useEffect(() => {
    if (configurationsData && configurationsData.data) {
      const configurations: Configuration[] = configurationsData.data
      const configValue = transformConfigurations(configurations)
      if (configValue[configToUse] && configValue[configToUse].length > 0) {
        console.log('ConfiguredInput', configValue[configToUse])
        setInputOptions(configValue[configToUse])
      }
    }
  }, [configToUse, configurationsData])

  const getInputFromType = (type: CONFIGURED_INPUT_TYPES) => {
    switch (type) {
      case CONFIGURED_INPUT_TYPES.SELECT:
        return (
          <SelectInput
            name={name}
            label={label}
            value={value}
            options={inputOptions}
            changeHandler={changeHandler}
            errorMessage={errorMessage}
            disabled={disabled}
            invalid={invalid}
            valid={valid}
            required={required}
          />
        )
      case CONFIGURED_INPUT_TYPES.RADIO:
        return (
          <RadioGroup
            question={label}
            name={name}
            options={inputOptions}
            changeHandler={changeHandler}
            value={value}
            errorMessage={errorMessage}
            required={required}
          />
        )
      case CONFIGURED_INPUT_TYPES.CHECKBOX:
        // The value and changeHandler are not used in the checkbox group but are required for the component
        // hence an empty string and a function must be provided for the component to work
        return (
          <CheckboxGroup
            question={label}
            options={inputOptions.map(option => {
              return option.value
            })}
            changeHandler={checkboxChangeHandler}
            checkedValue={checkboxValue}
            errorMessage={errorMessage}
            required={required}
          />
        )
      default:
        return <SelectInput />
    }
  }
  return <>{getInputFromType(type)}</>
}

export default ConfiguredInput
