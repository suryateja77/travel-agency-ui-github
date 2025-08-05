import React, { FunctionComponent, useState } from 'react'
import { bemClass } from '@utils'
import Text from '@base/text'
import { DatePicker } from '@base'

import './style.scss'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

const blk = 'dashboard'

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const [testInput, setTestInput] = useState('')
  const [testRadio, setTestRadio] = useState('')
  const [testCheckbox, setTestCheckbox] = useState<Array<string>>([])
  const [testDate, setTestDate] = useState<Date | null>(null)
  const [testDateTime, setTestDateTime] = useState<Date | null>(null)
  const [validDate, setValidDate] = useState<Date | null>(new Date())
  const [invalidDate, setInvalidDate] = useState<Date | null>(null)

  const handleDateChange = (valueObj: { [arg: string]: string | number | Date | null }) => {
    const key = Object.keys(valueObj)[0]
    const value = valueObj[key] as Date | null
    
    if (key === 'testDate') {
      setTestDate(value)
    } else if (key === 'testDateTime') {
      setTestDateTime(value)
    } else if (key === 'validDate') {
      setValidDate(value)
    } else if (key === 'invalidDate') {
      setInvalidDate(value)
    }
  }

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Dashboard
        </Text>
      </div>
      
      <div className={bemClass([blk, 'content'])}>
        <div className={bemClass([blk, 'section'])}>
          <Text
            color="gray-darker"
            typography="m"
          >
            Date Picker Components Testing
          </Text>
          
          <div className={bemClass([blk, 'form-group'])}>
            <DatePicker
              label="Date Only"
              name="testDate"
              value={testDate}
              placeholder="Select a date"
              showTimeSelect={false}
              changeHandler={handleDateChange}
            />
          </div>
          
          <div className={bemClass([blk, 'form-group'])}>
            <DatePicker
              label="Date and Time"
              name="testDateTime"
              value={testDateTime}
              placeholder="Select date and time"
              showTimeSelect={true}
              changeHandler={handleDateChange}
            />
          </div>
          
          <div className={bemClass([blk, 'form-group'])}>
            <DatePicker
              label="Valid Date (Required)"
              name="validDate"
              value={validDate}
              placeholder="Required field"
              required={true}
              valid={!!validDate}
              changeHandler={handleDateChange}
            />
          </div>
          
          <div className={bemClass([blk, 'form-group'])}>
            <DatePicker
              label="Invalid Date"
              name="invalidDate"
              value={invalidDate}
              placeholder="This field has an error"
              required={true}
              invalid={true}
              errorMessage="This field is required"
              changeHandler={handleDateChange}
            />
          </div>
          
          <div className={bemClass([blk, 'form-group'])}>
            <DatePicker
              label="Disabled Date Picker"
              name="disabledDate"
              value={new Date()}
              placeholder="This is disabled"
              disabled={true}
              changeHandler={handleDateChange}
            />
          </div>
          
          <div className={bemClass([blk, 'form-group'])}>
            <DatePicker
              label="Small Size"
              name="smallDate"
              value={null}
              placeholder="Small size picker"
              size="small"
              changeHandler={handleDateChange}
            />
          </div>
          
          <div className={bemClass([blk, 'form-group'])}>
            <DatePicker
              label="Large Size"
              name="largeDate"
              value={null}
              placeholder="Large size picker"
              size="large"
              changeHandler={handleDateChange}
            />
          </div>
          
          <div className={bemClass([blk, 'form-group'])}>
            <DatePicker
              label="Rounded Style"
              name="roundedDate"
              value={null}
              placeholder="Rounded corners"
              rounded={true}
              changeHandler={handleDateChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
