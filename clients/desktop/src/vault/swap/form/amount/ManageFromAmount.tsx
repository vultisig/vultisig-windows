import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { textInputBorderRadius } from '../../../../lib/ui/css/textInput'
import { InputDebounce } from '../../../../lib/ui/inputs/InputDebounce'
import { text } from '../../../../lib/ui/text'
import { useFromAmount } from '../../state/fromAmount'
import { useFromCoin } from '../../state/fromCoin'
import { AmountContainer } from './AmountContainer'
import { SwapFiatAmount } from './SwapFiatAmount'

const Input = styled.input`
  outline: none;
  background: transparent;
  ${textInputBorderRadius};
  text-align: right;

  ${text({
    weight: 500,
    size: 22,
    color: 'supporting',
  })}

  &::placeholder {
    ${text({
      color: 'shy',
    })}
  }
`

export const ManageFromAmount = () => {
  const [value, setValue] = useFromAmount()
  const [fromCoin] = useFromCoin()
  const valueAsString = value?.toString() ?? ''
  const [inputValue, setInputValue] = useState<string>(valueAsString)

  const handleInputValueChange = useCallback(
    (value: string) => {
      value = value.replace(/-/g, '')

      if (value === '') {
        setInputValue('')
        if (value !== inputValue) setValue?.(null)
        return
      }

      const valueAsNumber = parseFloat(value)
      if (isNaN(valueAsNumber)) {
        return
      }

      setInputValue(
        valueAsNumber.toString() !== value ? value : valueAsNumber.toString()
      )
      setValue?.(valueAsNumber)
    },
    [inputValue, setValue]
  )

  return (
    <AmountContainer gap={6} alignItems="flex-end">
      <InputDebounce
        value={
          Number(valueAsString) === Number(inputValue)
            ? inputValue
            : valueAsString
        }
        onChange={handleInputValueChange}
        render={({ value, onChange }) => (
          <Input
            type="number"
            placeholder={'0'}
            onWheel={event => event.currentTarget.blur()}
            value={value}
            onChange={({ currentTarget: { value } }) => onChange(value)}
          />
        )}
      />
      {value !== null && (
        <SwapFiatAmount value={{ amount: value, ...fromCoin }} />
      )}
    </AmountContainer>
  )
}
