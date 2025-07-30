import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import {
  AmountTextInput,
  AmountTextInputProps,
} from '@lib/ui/inputs/AmountTextInput'
import { InputProps } from '@lib/ui/props'
import { useMemo, useState } from 'react'

type FiatSendAmountInputProps = Omit<
  AmountTextInputProps,
  'value' | 'onChange' | 'onValueChange'
> &
  InputProps<bigint | null> & {
    decimals: number
    price: number
  }

export const FiatSendAmountInput = ({
  value,
  onChange,
  decimals,
  price,
  ...props
}: FiatSendAmountInputProps) => {
  const expectedInputValue =
    value === null ? null : fromChainAmount(value, decimals) * price

  const [inputValue, setInputValue] = useState<number | null>(
    expectedInputValue
  )

  const preservedInputValue = useMemo(() => {
    if (inputValue === null) {
      return null
    }

    const chainInputValue = toChainAmount(inputValue / price, decimals)
    if (chainInputValue === value) {
      return inputValue
    }

    return expectedInputValue
  }, [decimals, expectedInputValue, inputValue, price, value])

  return (
    <AmountTextInput
      {...props}
      value={preservedInputValue}
      onValueChange={value => {
        setInputValue(value)
        onChange(value === null ? null : toChainAmount(value / price, decimals))
      }}
    />
  )
}
