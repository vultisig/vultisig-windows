import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isEqual } from '@lib/utils/number/isEqual'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { SendCoinBalanceDependant } from '../coin/balance/SendCoinBalanceDependant'
import { AnimatedSendFormInputError } from '../components/AnimatedSendFormInputError'
import { HorizontalLine } from '../components/HorizontalLine'
import { SendInputContainer } from '../components/SendInputContainer'
import { SendFiatFee } from '../fee/SendFiatFeeWrapper'
import { SendGasFeeWrapper } from '../fee/SendGasFeeWrapper'
import { ManageFeeSettings } from '../fee/settings/ManageFeeSettings'
import { ManageMemo } from '../memo/ManageMemo'
import { useSendFormFieldState } from '../state/formFields'
import { AmountInReverseCurrencyDisplay } from './AmountInReverseCurrencyDisplay'
import { AmountSuggestion } from './AmountSuggestion'
import { CurrencySwitch } from './AmountSwitch'
import { useDualCurrencyAmountInput } from './hooks/useDualCurrencyAmountInput'
import { baseToFiat } from './utils'

const suggestions = [0.25, 0.5, 0.75, 1]
export type CurrencyInputMode = 'base' | 'fiat'

export const ManageAmountInputField = () => {
  const [currencyInputMode, setCurrencyInputMode] =
    useState<CurrencyInputMode>('base')

  const [{ coin: coinKey }] = useCoreViewState<'send'>()
  const coin = useCurrentVaultCoin(coinKey)
  const { data: coinPrice } = useCoinPriceQuery({ coin })
  const { inputValue, handleUpdateAmount, value } = useDualCurrencyAmountInput({
    coinPrice,
    currencyInputMode,
  })

  const [
    {
      errors: { amount: amountError },
    },
  ] = useSendFormFieldState()

  const { t } = useTranslation()
  const { decimals, ticker } = coin

  const error = !!amountError && value ? amountError : undefined

  return (
    <SendInputContainer flexGrow>
      <HStack justifyContent="space-between" alignItems="center">
        <InputLabel>{t('amount')}</InputLabel>
        <ManageFeeSettings />
      </HStack>
      <HorizontalLine />
      <VStack gap={8}>
        <HStack alignItems="flex-start" gap={4}>
          <VStack flexGrow gap={8}>
            <ActionInsideInteractiveElement
              render={() => (
                <AmountTextInput
                  validation={error ? 'warning' : undefined}
                  placeholder={t('enter_amount')}
                  value={inputValue}
                  onValueChange={value => handleUpdateAmount(value)}
                />
              )}
              action={
                <HStack gap={8}>
                  <AmountInReverseCurrencyDisplay value={currencyInputMode} />
                </HStack>
              }
              actionPlacerStyles={{
                right: 12,
                bottom: 20,
              }}
            />
            <SendCoinBalanceDependant
              pending={() => null}
              error={() => null}
              success={amount => (
                <HStack alignItems="center" gap={4}>
                  <CurrencySwitch
                    value={currencyInputMode}
                    onClick={value => setCurrencyInputMode(value)}
                  />
                  {suggestions.map(suggestion => {
                    const baseAmount = fromChainAmount(amount, decimals)
                    const suggestionBaseValue = baseAmount * suggestion

                    const suggestionValue =
                      currencyInputMode === 'base'
                        ? suggestionBaseValue
                        : (baseToFiat(suggestionBaseValue, coinPrice) ?? 0)

                    return (
                      <SuggestionOption
                        isActive={
                          inputValue
                            ? isEqual(inputValue, suggestionValue)
                            : false
                        }
                        onClick={() => {
                          handleUpdateAmount(
                            currencyInputMode === 'base'
                              ? suggestionBaseValue
                              : baseToFiat(suggestionBaseValue, coinPrice)
                          )
                        }}
                        key={suggestion}
                        value={suggestion}
                      />
                    )
                  })}
                </HStack>
              )}
            />
            {error && <AnimatedSendFormInputError error={error} />}
            <SendCoinBalanceDependant
              pending={() => null}
              error={() => null}
              success={amount => (
                <TotalBalanceWrapper
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text as="span" size={14} color="contrast">
                    {t('balance_available')}:
                  </Text>{' '}
                  <Text size={14}>
                    {`${fromChainAmount(amount, decimals)} ${ticker} `}
                  </Text>
                </TotalBalanceWrapper>
              )}
            />
          </VStack>
        </HStack>
      </VStack>
      <ManageMemo />
      <HorizontalLine />
      <StrictInfoRow>
        <SendFiatFee />
      </StrictInfoRow>
      <StrictInfoRow>
        <SendGasFeeWrapper />
      </StrictInfoRow>
    </SendInputContainer>
  )
}

const TotalBalanceWrapper = styled(HStack)`
  background-color: ${getColor('foreground')};
  padding: 16px;
  ${borderRadius.m}
`

const SuggestionOption = styled(AmountSuggestion)`
  padding: 6px 18px;
  width: fit-content;
`
