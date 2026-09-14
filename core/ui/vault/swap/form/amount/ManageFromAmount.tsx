import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { getFiatCurrencySymbol } from '@core/ui/chain/utils/getFiatCurrencySymbol'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Match } from '@lib/ui/base/Match'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { textInputHeight } from '@lib/ui/css/textInput'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useStateCorrector } from '@lib/ui/state/useStateCorrector'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { multiplyBigInt } from '@vultisig/lib-utils/bigint/bigIntMultiplyByNumber'
import { bigIntToDecimalString } from '@vultisig/lib-utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { useFromAmount } from '../../state/fromAmount'
import { useSwapFromCoin } from '../../state/fromCoin'
import { SwapCoinBalanceDependant } from '../balance/SwapCoinBalanceDependant'
import { AmountContainer } from './AmountContainer'
import { getFiatInputValue, parseFiatInputValue } from './fiatInputValue'
import { SwapFiatAmount } from './SwapFiatAmount'

type ManageFromAmountProps = {
  coinPill: ReactNode
}

type FromAmountInputMode = 'token' | 'fiat'

const fiatInputPlaceholder = '0'

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

type GetSuggestionDisplayValueInput = {
  amount: bigint
  decimals: number
  chain: Chain
}

/**
 * Renders a suggestion amount for display, cropped to a few fraction digits.
 * Display only — the stored swap amount must stay the exact bigint, or Max
 * would silently swap less than the full balance (#4390).
 */
export const getSuggestionDisplayValue = ({
  amount,
  decimals,
  chain,
}: GetSuggestionDisplayValueInput) => {
  const decimalString = bigIntToDecimalString(amount, decimals)
  const maxDisplayDecimals = chain === Chain.Bitcoin ? 8 : 4
  const [integerPart, decimalPart] = decimalString.split('.')
  const croppedDecimal = decimalPart
    ? `.${decimalPart.slice(0, maxDisplayDecimals)}`
    : ''
  const cropped = `${integerPart}${croppedDecimal}`

  return cropped.includes('.') ? cropped.replace(/\.?0+$/, '') : cropped
}

/**
 * The From side of the swap form: the coin pill, the amount field, and the
 * balance suggestions. The pill arrives as an element because the suggestions
 * sit on their own row beneath both, which they can only do from inside the
 * component that owns the input's value.
 *
 * The field is token-denominated; tapping the fiat line under it flips the
 * two so a fiat amount can be typed instead. Fiat is input conversion only:
 * every keystroke is turned into a token amount with the same price the fiat
 * line is rendered from, and that token amount is what the quote and the
 * keysign see. Without a price the fiat line is not tappable and the field
 * falls back to token input.
 */
export const ManageFromAmount = ({ coinPill }: ManageFromAmountProps) => {
  const [value, setValue] = useFromAmount()
  const [fromCoinKey] = useSwapFromCoin()
  const swapCoin = useCurrentVaultCoin(fromCoinKey)
  const { decimals } = swapCoin
  const fiatCurrency = useFiatCurrency()
  const priceQuery = useCoinPriceQuery({ coin: swapCoin })
  const price =
    priceQuery.data !== undefined && priceQuery.data > 0
      ? priceQuery.data
      : undefined
  const previousValueRef = useRef<bigint | null>(null)
  const hasSwitchedModeRef = useRef(false)

  const [inputMode, setInputMode] = useStateCorrector(
    useState<FromAmountInputMode>('token'),
    mode => (price === undefined ? 'token' : mode)
  )

  const tokenAmount = value !== null ? fromChainAmount(value, decimals) : null

  const toFiatInputValue = (chainAmount: bigint | null) =>
    chainAmount === null || price === undefined
      ? ''
      : getFiatInputValue(fromChainAmount(chainAmount, decimals) * price)

  const fullDecimalString =
    value !== null ? bigIntToDecimalString(value, decimals) : ''
  const trimmedDecimalString = fullDecimalString.includes('.')
    ? fullDecimalString.replace(/\.?0+$/, '')
    : fullDecimalString
  const [inputValue, setInputValue] = useState<string>(trimmedDecimalString)
  const [fiatInputValue, setFiatInputValue] = useState<string>('')
  const isFeeCoinSelected = isFeeCoin(fromCoinKey)

  useEffect(() => {
    // Only update the inputs if the value changed externally (not from user
    // typing). We detect this by checking if the value changed but the input
    // doesn't match
    if (value !== previousValueRef.current) {
      const currentInputAsBigInt = parseAmountInputValue(inputValue, decimals)
      if (currentInputAsBigInt !== value) {
        // Remove trailing zeros from the decimal string for display
        setInputValue(trimmedDecimalString)
      }
      setFiatInputValue(
        value === null || price === undefined
          ? ''
          : getFiatInputValue(fromChainAmount(value, decimals) * price)
      )
      previousValueRef.current = value
    }
  }, [value, trimmedDecimalString, inputValue, decimals, price])

  const handleInputValueChange = (value: string) => {
    value = value.replace(/-/g, '')

    if (value.startsWith('.')) {
      value = `0${value}`
    }

    if (value === '') {
      setInputValue('')
      previousValueRef.current = null
      setValue(null)
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
    previousValueRef.current = chainAmount
    setValue(chainAmount)
  }

  const handleFiatInputValueChange = (rawValue: string) => {
    const normalized = parseFiatInputValue(rawValue)
    if (normalized === undefined) {
      return
    }

    if (normalized === '') {
      setFiatInputValue('')
      previousValueRef.current = null
      setValue(null)
      return
    }

    const chainAmount = toChainAmount(
      Number(normalized) / shouldBePresent(price, 'from coin price'),
      decimals
    )

    setFiatInputValue(normalized)
    previousValueRef.current = chainAmount
    setValue(chainAmount)
  }

  const enterFiatMode = () => {
    hasSwitchedModeRef.current = true
    setFiatInputValue(toFiatInputValue(value))
    setInputMode('fiat')
  }

  const enterTokenMode = () => {
    hasSwitchedModeRef.current = true
    setInputValue(trimmedDecimalString)
    setInputMode('token')
  }

  const suggestions = isFeeCoinSelected
    ? [0.25, 0.5, 0.75]
    : [0.25, 0.5, 0.75, 1]

  return (
    <VStack fullWidth gap={16}>
      <HStack justifyContent="space-between" alignItems="flex-start" gap={8}>
        {coinPill}
        <VStack gap={4} alignItems="flex-end">
          <AmountContainer gap={6} alignItems="flex-end">
            <Match
              value={inputMode}
              token={() => (
                <>
                  <PositionedAmountInput
                    type="text"
                    inputMode="decimal"
                    placeholder={'0'}
                    autoFocus={hasSwitchedModeRef.current}
                    onWheel={event => event.currentTarget.blur()}
                    value={inputValue}
                    onValueChange={handleInputValueChange}
                    onPaste={event => {
                      event.preventDefault()
                      handleInputValueChange(
                        event.clipboardData.getData('text')
                      )
                    }}
                    data-testid="swap-from-amount-input"
                  />
                  <SwapFiatAmount
                    value={{ ...fromCoinKey, amount: tokenAmount ?? 0 }}
                    onClick={enterFiatMode}
                    testId="swap-from-fiat-amount"
                  />
                </>
              )}
              fiat={() => (
                <>
                  <FiatInputRow alignItems="center" justifyContent="flex-end">
                    <Text size={22} weight={500} color="contrast">
                      {getFiatCurrencySymbol(fiatCurrency)}
                    </Text>
                    <FiatInputSizer>
                      <FiatInputMeasure aria-hidden>
                        {fiatInputValue || fiatInputPlaceholder}
                      </FiatInputMeasure>
                      <FiatAmountInput
                        type="text"
                        inputMode="decimal"
                        placeholder={fiatInputPlaceholder}
                        autoFocus
                        value={fiatInputValue}
                        onChange={event =>
                          handleFiatInputValueChange(event.currentTarget.value)
                        }
                        onPaste={event => {
                          event.preventDefault()
                          handleFiatInputValueChange(
                            event.clipboardData.getData('text')
                          )
                        }}
                        data-testid="swap-from-fiat-amount-input"
                      />
                    </FiatInputSizer>
                  </FiatInputRow>
                  <TokenAmountButton
                    onClick={enterTokenMode}
                    data-testid="swap-from-token-amount"
                  >
                    {formatAmount(tokenAmount ?? 0, swapCoin)}
                  </TokenAmountButton>
                </>
              )}
            />
          </AmountContainer>
        </VStack>
      </HStack>
      <SwapCoinBalanceDependant
        coin={swapCoin}
        pending={() => null}
        error={() => null}
        success={amount => (
          <SuggestionRow alignItems="center" gap={8}>
            {suggestions.map(suggestion => (
              <AmountSuggestion
                onClick={() => {
                  const suggestionAmount = multiplyBigInt(amount, suggestion)

                  setInputValue(
                    getSuggestionDisplayValue({
                      amount: suggestionAmount,
                      decimals,
                      chain: fromCoinKey.chain,
                    })
                  )
                  setFiatInputValue(toFiatInputValue(suggestionAmount))
                  previousValueRef.current = suggestionAmount
                  setValue(suggestionAmount)
                }}
                key={suggestion}
                value={suggestion}
              />
            ))}
          </SuggestionRow>
        )}
      />
    </VStack>
  )
}

/**
 * The suggestions span the card rather than sharing the amount field's column,
 * so four of them get an equal share of the full width instead of being
 * squeezed into whatever the coin pill leaves.
 */
const SuggestionRow = styled(HStack)`
  width: 100%;
`

/**
 * The text-input frame pads both sides; the right one is dropped so the
 * digits end on the card's edge, in line with the To amount and the fiat
 * line under them.
 */
const PositionedAmountInput = styled(TextInput)`
  text-align: right;
  padding-right: 0;
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

/**
 * Same box as the token field so the card does not jump when the two swap
 * places; the symbol and the digits sit flush because the input is sized to
 * its content instead of stretching across the row.
 */
const FiatInputRow = styled(HStack)`
  height: ${textInputHeight}px;
`

const fiatInputFont = css`
  font-family: inherit;
  font-size: 22px;
  font-weight: 500;
`

/**
 * The input takes its width from a hidden copy of its text, so the digits
 * end exactly where the fiat line under them does; the two extra pixels past
 * that leave room for the caret. The input is taken out of flow because an
 * input's own intrinsic width would otherwise stretch the box past the text.
 */
const FiatInputSizer = styled.div`
  position: relative;
  max-width: 100%;
`

const FiatInputMeasure = styled.span`
  display: block;
  visibility: hidden;
  white-space: pre;
  ${fiatInputFont};
`

const FiatAmountInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: calc(100% + 2px);
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: ${getColor('contrast')};
  ${fiatInputFont};

  &::placeholder {
    ${text({ color: 'shy', size: 18, weight: '500' })}
  }
`

const TokenAmountButton = styled(UnstyledButton)`
  ${text({
    color: 'shy',
    weight: 500,
    size: 12,
  })};
`
