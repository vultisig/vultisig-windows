import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'
import { bigIntToDecimalString } from '@lib/utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@lib/utils/bigint/decimalStringToBigInt'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { useFromAmount } from '../../state/fromAmount'
import { useSwapFromCoin } from '../../state/fromCoin'
import { SwapCoinBalanceDependant } from '../balance/SwapCoinBalanceDependant'
import { AmountContainer } from './AmountContainer'
import { SwapFiatAmount } from './SwapFiatAmount'

export const ManageFromAmount = () => {
  const [value, setValue] = useFromAmount()
  const [fromCoinKey] = useSwapFromCoin()
  const swapCoin = useCurrentVaultCoin(fromCoinKey)
  const { decimals } = swapCoin
  const previousValueRef = useRef<bigint | null>(null)

  const fullDecimalString =
    value !== null ? bigIntToDecimalString(value, decimals) : ''
  const trimmedDecimalString = fullDecimalString.includes('.')
    ? fullDecimalString.replace(/\.?0+$/, '')
    : fullDecimalString
  const [inputValue, setInputValue] = useState<string>(trimmedDecimalString)
  const isFeeCoinSelected = isFeeCoin(fromCoinKey)

  useEffect(() => {
    // Only update input if the value changed externally (not from user typing)
    // We detect this by checking if the value changed but the input doesn't match
    if (value !== previousValueRef.current) {
      const currentInputAsBigInt =
        inputValue === '' ? null : decimalStringToBigInt(inputValue, decimals)
      if (currentInputAsBigInt !== value) {
        // Remove trailing zeros from the decimal string for display
        setInputValue(trimmedDecimalString)
      }
      previousValueRef.current = value
    }
  }, [value, trimmedDecimalString, inputValue, decimals])

  const handleInputValueChange = useCallback(
    (value: string) => {
      value = value.replace(/-/g, '')
      if (value === '') {
        setInputValue('')
        setValue?.(null)
        return
      }

      try {
        const chainAmount = decimalStringToBigInt(value, decimals)
        setInputValue(value)
        setValue?.(chainAmount)
      } catch {
        return
      }
    },
    [decimals, setValue]
  )

  const suggestions = [0.25, 0.5, isFeeCoinSelected ? 0.75 : 1]

  return (
    <VStack gap={4} alignItems="flex-end">
      <AmountContainer gap={6} alignItems="flex-end">
        <PositionedAmountInput
          type="text"
          inputMode="decimal"
          placeholder={'0'}
          onWheel={event => event.currentTarget.blur()}
          value={inputValue}
          onValueChange={handleInputValueChange}
        />
        {value !== null && (
          <SwapFiatAmount
            value={{
              ...fromCoinKey,
              amount: fromChainAmount(value, decimals),
            }}
          />
        )}
      </AmountContainer>
      <SwapCoinBalanceDependant
        coin={swapCoin}
        pending={() => null}
        error={() => null}
        success={amount => (
          <HStack alignItems="center" gap={4}>
            {suggestions.map(suggestion => (
              <AmountSuggestion
                onClick={() => {
                  const suggestionAmount = multiplyBigInt(amount, suggestion)
                  const decimalString = bigIntToDecimalString(
                    suggestionAmount,
                    decimals
                  )
                  const trimmed = decimalString.includes('.')
                    ? decimalString.replace(/\.?0+$/, '')
                    : decimalString
                  handleInputValueChange(trimmed)
                }}
                key={suggestion}
                value={suggestion}
              />
            ))}
          </HStack>
        )}
      />
    </VStack>
  )
}

const PositionedAmountInput = styled(TextInput)`
  text-align: right;
  border: none;
  font-family: inherit;
  font-size: 22px;
  font-weight: 500;
  &:hover {
    outline: none;
  }
  &::placeholder {
    font-size: 18px;
  }
`
