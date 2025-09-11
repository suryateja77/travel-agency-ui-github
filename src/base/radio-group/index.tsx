import React, { FunctionComponent } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import RadioInput from './components/radio-input'
import Text from '@base/text'

const blk = 'radio-group'

interface RadioGroupProps {
  question?: string
  options: Array<{ key: string; value: string }>
  name: string
  changeHandler: (obj: Record<string, string>) => void
  value: string
  required?: boolean
  errorMessage?: string
  direction?: 'horizontal' | 'vertical'
}

const RadioGroup: FunctionComponent<RadioGroupProps> = ({ options, name, errorMessage, changeHandler, value, required, question, direction = 'vertical' }) => {
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
      <div className={bemClass([blk, 'options', { [direction]: true }])}>
        {options.map((option, index) => {
          return (
            <RadioInput
              key={option.key + index}
              id={option.key}
              name={name}
              changeHandler={changeHandler}
              label={option.value}
              value={value}
              option={option}
            />
          )
        })}
      </div>
    </div>
  )
}

export default RadioGroup
