import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { HStack } from '@lib/ui/layout/Stack'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { AmountTextInput } from '../../../../lib/ui/inputs/AmountTextInput'
import { AmountSuggestion } from '../../../send/amount/AmountSuggestion'
import { useCurrentVaultCoin } from '../../../state/currentVault'
import { useFromAmount } from '../../state/fromAmount'
import { useFromCoin } from '../../state/fromCoin'
import { SwapCoinBalanceDependant } from '../balance/SwapCoinBalanceDependant'
import { AmountContainer } from './AmountContainer'
import { SwapFiatAmount } from './SwapFiatAmount'

const suggestions = [0.25, 0.5]

export const ManageFromAmount = () => {
  const [value, setValue] = useFromAmount()
  const [fromCoin] = useFromCoin()
  const valueAsString = value?.toString() ?? ''
  const [inputValue, setInputValue] = useState<string>(valueAsString)

  const swapCoin = useCurrentVaultCoin(fromCoin)
  const { decimals } = swapCoin

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
      <PositionedAmountInput
        type="number"
        placeholder={'0'}
        onWheel={event => event.currentTarget.blur()}
        value={Number(value)}
        onChange={e => handleInputValueChange(e.target.value)}
        suggestion={
          <SwapCoinBalanceDependant
            coin={swapCoin}
            pending={() => null}
            error={() => null}
            success={amount => (
              <HStack alignItems="center" gap={4}>
                {suggestions.map(suggestion => (
                  <AmountSuggestion
                    onClick={() =>
                      handleInputValueChange(
                        String(fromChainAmount(amount, decimals) * suggestion)
                      )
                    }
                    key={suggestion}
                    value={suggestion}
                  />
                ))}
              </HStack>
            )}
          />
        }
      />

      {value !== null && (
        <SwapFiatAmount value={{ amount: value, ...fromCoin }} />
      )}
    </AmountContainer>
  )
}

const PositionedAmountInput = styled(AmountTextInput)`
  text-align: right;

  border: none;
  font-family: inherit;
  &:hover {
    outline: none;
  }
`
