import { memo, FunctionComponent } from 'react'

interface CurrencyProps {
  data: number | string
}

const Currency: FunctionComponent<CurrencyProps> = ({ data }) => (
  <span>
    <i className="fa fa-inr color-gray vertical-middle" />
    &nbsp;
    {Number(data).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}
  </span>
)

export default memo(Currency)