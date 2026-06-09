import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { multiplyBigInt } from '@vultisig/lib-utils/bigint/bigIntMultiplyByNumber'
import { bigIntToDecimalString } from '@vultisig/lib-utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { useFromAmount } from '../../state/fromAmount'
import { useSwapFromCoin } from '../../state/fromCoin'
import { SwapCoinBalanceDependant } from '../balance/SwapCoinBalanceDependant'
import { AmountContainer } from './AmountContainer'
import { SwapFiatAmount } from './SwapFiatAmount'

const fromAmountInputDebounceMs = 300

const parseAmountInputValue = (value: string, decimals: number) => {
  if (value === '') {
    return null
  }

  try {
    return decimalStringToBigInt(value, decimals)
  } catch {
    return undefined
  }
}

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
  const inputAmount = parseAmountInputValue(inputValue, decimals)
  const debouncedInputAmount = useDebounce(
    inputAmount,
    fromAmountInputDebounceMs
  )
  const isFeeCoinSelected = isFeeCoin(fromCoinKey)

  useEffect(() => {
    // Only update input if the value changed externally (not from user typing)
    // We detect this by checking if the value changed but the input doesn't match
    if (value !== previousValueRef.current) {
      const currentInputAsBigInt = parseAmountInputValue(inputValue, decimals)
      if (currentInputAsBigInt !== value) {
        // Remove trailing zeros from the decimal string for display
        setInputValue(trimmedDecimalString)
      }
      previousValueRef.current = value
    }
  }, [value, trimmedDecimalString, inputValue, decimals])

  useEffect(() => {
    if (
      debouncedInputAmount === undefined ||
      debouncedInputAmount !== inputAmount
    ) {
      return
    }

    if (debouncedInputAmount !== value) {
      previousValueRef.current = debouncedInputAmount
      setValue?.(debouncedInputAmount)
    }
  }, [debouncedInputAmount, inputAmount, setValue, value])

  const handleInputValueChange = (value: string, shouldCommitNow = false) => {
    value = value.replace(/-/g, '')

    if (value.startsWith('.')) {
      value = `0${value}`
    }

    if (value === '') {
      setInputValue('')
      if (shouldCommitNow) {
        previousValueRef.current = null
        setValue?.(null)
      }
      return
    }

    if (!/^\d*\.?\d*$/.test(value)) {
      return
    }

    const chainAmount = parseAmountInputValue(value, decimals)
    if (chainAmount === undefined) {
      return
    }

    setInputValue(value)
    if (shouldCommitNow) {
      previousValueRef.current = chainAmount
      setValue?.(chainAmount)
    }
  }

  const suggestions = isFeeCoinSelected
    ? [0.25, 0.5, 0.75]
    : [0.25, 0.5, 0.75, 1]

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
          onPaste={event => {
            event.preventDefault()
            handleInputValueChange(event.clipboardData.getData('text'), true)
          }}
          data-testid="swap-from-amount-input"
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
          <HStack alignItems="center" gap={4} wrap="wrap">
            {suggestions.map(suggestion => (
              <AmountSuggestion
                onClick={() => {
                  const suggestionAmount = multiplyBigInt(amount, suggestion)
                  const decimalString = bigIntToDecimalString(
                    suggestionAmount,
                    decimals
                  )
                  const maxDisplayDecimals =
                    fromCoinKey.chain === Chain.Bitcoin ? 8 : 4
                  const [integerPart, decimalPart] = decimalString.split('.')
                  const croppedDecimal = decimalPart
                    ? `.${decimalPart.slice(0, maxDisplayDecimals)}`
                    : ''
                  const cropped = `${integerPart}${croppedDecimal}`
                  const trimmed = cropped.includes('.')
                    ? cropped.replace(/\.?0+$/, '')
                    : cropped
                  handleInputValueChange(trimmed, true)
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
