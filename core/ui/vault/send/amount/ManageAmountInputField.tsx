import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { UtxoBasedChain } from '@core/chain/Chain'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { clampDecimals } from '@lib/utils/number/clampDecimals'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { SendCoinBalanceDependant } from '../coin/balance/SendCoinBalanceDependant'
import { AnimatedSendFormInputError } from '../components/AnimatedSendFormInputError'
import { HorizontalLine } from '../components/HorizontalLine'
import { SendInputContainer } from '../components/SendInputContainer'
import { SendFiatFee } from '../fee/SendFiatFeeWrapper'
import { SendGasFeeWrapper } from '../fee/SendGasFeeWrapper'
import { ManageFeeSettings } from '../fee/settings/ManageFeeSettings'
import { ManageMemo } from '../memo/ManageMemo'
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'
import { useSendFormFieldState } from '../state/formFields'
import { useCurrentSendCoin } from '../state/sendCoin'
import { AmountInReverseCurrencyDisplay } from './AmountInReverseCurrencyDisplay'
import { AmountSuggestion } from './AmountSuggestion'
import { CurrencySwitch } from './AmountSwitch'
import { useDualCurrencyAmountInput } from './hooks/useDualCurrencyAmountInput'
import { baseToFiat } from './utils'

const suggestions = [0.25, 0.5, 0.75, 1]
const maxSuggestion = 1

export type CurrencyInputMode = 'base' | 'fiat'

export const ManageAmountInputField = () => {
  const [currencyInputMode, setCurrencyInputMode] =
    useState<CurrencyInputMode>('base')

  const coin = useCurrentSendCoin()
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
  const chainSpecificQuery = useSendChainSpecificQuery()

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
                <InputWrapper>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currencyInputMode}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <AmountTextInput
                        validation={error ? 'warning' : undefined}
                        placeholder={t('enter_amount')}
                        value={inputValue}
                        onValueChange={handleUpdateAmount}
                      />
                    </motion.div>
                  </AnimatePresence>
                  <AmountInReverseCurrencyDisplay value={currencyInputMode} />
                </InputWrapper>
              )}
              action={
                <HStack gap={8}>
                  <CurrencySwitch
                    value={currencyInputMode}
                    onClick={value => setCurrencyInputMode(value)}
                  />
                </HStack>
              }
              actionPlacerStyles={{
                right: 0,
                bottom: 55,
              }}
            />
            <SendCoinBalanceDependant
              pending={() => null}
              error={() => null}
              success={amount => (
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  gap={4}
                >
                  {suggestions.map(suggestion => {
                    let suggestionBaseValue =
                      fromChainAmount(amount, decimals) * suggestion

                    if (
                      suggestion === maxSuggestion &&
                      !isOneOf(coin.chain, Object.values(UtxoBasedChain))
                    ) {
                      suggestionBaseValue = fromChainAmount(
                        amount -
                          (chainSpecificQuery.data
                            ? getFeeAmount(chainSpecificQuery.data)
                            : BigInt(0)),
                        decimals
                      )
                    }

                    const suggestionValue =
                      currencyInputMode === 'base'
                        ? suggestionBaseValue
                        : (baseToFiat(suggestionBaseValue, coinPrice) ?? 0)

                    const isActive =
                      inputValue !== null &&
                      toChainAmount(inputValue, coin.decimals) ===
                        toChainAmount(suggestionValue, coin.decimals)

                    return (
                      <SuggestionOption
                        isActive={isActive}
                        onClick={() => {
                          const rawValue =
                            currencyInputMode === 'base'
                              ? suggestionBaseValue
                              : (baseToFiat(suggestionBaseValue, coinPrice) ??
                                0)
                          handleUpdateAmount(
                            clampDecimals(rawValue, coin.decimals)
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

const InputWrapper = styled.div`
  height: 170px;
  ${vStack({
    justifyContent: 'center',
    alignItems: 'center',
  })}
  * > input {
    text-align: center;
    font-size: 32px;
    background-color: transparent;
    border: none;

    &:focus,
    &:hover {
      outline: none;
    }

    &::placeholder {
      font-size: 24px;
    }
  }
`

const TotalBalanceWrapper = styled(HStack)`
  background-color: ${getColor('foreground')};
  padding: 16px;
  ${borderRadius.m}
`

const SuggestionOption = styled(AmountSuggestion)`
  flex: 1;
  padding: 6px 18px;
  border-radius: 99px;
`
