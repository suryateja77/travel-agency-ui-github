import React, { FunctionComponent } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import RadioInput from './components/radio-input'
import Text from '@base/text'

const blk = 'radio-group'

interface RadioGroupProps {
  question?: string
  options: Array<string>
  name: string
  changeHandler: (obj: Record<string, string>) => void
  value: string
  required?: boolean
  errorMessage?: string
}

const RadioGroup: FunctionComponent<RadioGroupProps> = ({ options, name, errorMessage, changeHandler, value, required, question }) => {
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'label-container'])}>
        {question && (
          <label className={bemClass([blk, 'label'])}>
            {question}
            {required && <span className={bemClass([blk, 'star'])}>*</span>}
          </label>
        )}
        <Text color="error">{errorMessage}</Text>
      </div>
      {options.map((option, index) => {
        return (
          <RadioInput
            key={option.toString() + index + 'radio'}
            id={option}
            name={name}
            changeHandler={changeHandler}
            label={option}
            value={value}
          />
        )
      })}
    </div>
  )
}

export default RadioGroup
