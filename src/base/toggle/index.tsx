import React, { FunctionComponent } from 'react'
import { bemClass } from '@utils'

import './style.scss'

interface ChangeArg {
  [arg: string]: boolean
}

interface ToggleProps {
  name?: string
  label?: string
  checked?: boolean
  disabled?: boolean
  className?: string
  changeHandler?: (arg: ChangeArg) => void
}

const blk = 'toggle'

const Toggle: FunctionComponent<ToggleProps> = ({
  name = 'toggle',
  label = '',
  checked = false,
  disabled = false,
  className = '',
  changeHandler = () => {},
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeHandler({ [name]: event.target.checked })
  }

  const eltClass = bemClass([
    blk,
    {
      disabled: disabled,
    },
    className,
  ])

  const sliderClass = bemClass([
    blk,
    'slider',
    {
      checked: checked,
      disabled: disabled,
    },
  ])

  return (
    <div className={eltClass}>
      <div className={bemClass([blk, 'switch'])}>
        <input
          type="checkbox"
          className={bemClass([blk, 'input'])}
          disabled={disabled}
          checked={checked}
          onChange={handleChange}
          id={name}
          name={name}
        />
        <label htmlFor={name} className={sliderClass} />
      </div>
      {label && <div className={bemClass([blk, 'label'])}>{label}</div>}
    </div>
  )
}

export default Toggle