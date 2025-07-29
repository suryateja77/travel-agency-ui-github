import React, { FunctionComponent } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import Text from '@base/text'
import CheckBox from '@base/check-box'

const blk = 'checkbox-group'

interface CheckboxGroupProps {
  question?: string
  options: Array<string>
  changeHandler: (obj: Record<string, boolean>) => void
  checkedValue: Array<string>
  required?: boolean
  errorMessage?: string
}

const CheckboxGroup: FunctionComponent<CheckboxGroupProps> = ({ options, errorMessage, changeHandler, checkedValue, required, question }) => {
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
          <CheckBox
            key={option.toString() + index + 'checkbox'}
            id={option}
            changeHandler={changeHandler}
            label={option}
            checked={checkedValue.includes(option)}
          />
        )
      })}
    </div>
  )
}

export default CheckboxGroup
