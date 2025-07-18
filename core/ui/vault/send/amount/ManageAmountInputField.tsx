import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { UtxoBasedChain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { AmountInReverseCurrencyDisplay } from '@core/ui/vault/send/amount/AmountInReverseCurrencyDisplay'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { CurrencySwitch } from '@core/ui/vault/send/amount/AmountSwitch'
import { useDualCurrencyAmountInput } from '@core/ui/vault/send/amount/hooks/useDualCurrencyAmountInput'
import { baseToFiat } from '@core/ui/vault/send/amount/utils'
import { SendCoinBalanceDependant } from '@core/ui/vault/send/coin/balance/SendCoinBalanceDependant'
import { AnimatedSendFormInputError } from '@core/ui/vault/send/components/AnimatedSendFormInputError'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { SendFiatFee } from '@core/ui/vault/send/fee/SendFiatFeeWrapper'
import { SendGasFeeWrapper } from '@core/ui/vault/send/fee/SendGasFeeWrapper'
import { ManageFeeSettings } from '@core/ui/vault/send/fee/settings/ManageFeeSettings'
import { ManageMemo } from '@core/ui/vault/send/memo/ManageMemo'
import { useSendChainSpecificQuery } from '@core/ui/vault/send/queries/useSendChainSpecificQuery'
import { useSendFormFieldState } from '@core/ui/vault/send/state/formFields'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
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

const suggestions = [0.25, 0.5, 0.75, 1]

export type CurrencyInputMode = 'base' | 'fiat'

export const ManageAmountInputField = () => {
  const { t } = useTranslation()
  const [currencyInputMode, setCurrencyInputMode] =
    useState<CurrencyInputMode>('base')
  const chainSpecificQuery = useSendChainSpecificQuery()
  const coin = useCurrentSendCoin()
  const isNativeToken = isFeeCoin(coin)
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
              success={amount => {
                let maxValue = fromChainAmount(amount, coin.decimals)

                if (
                  maxValue > 0 &&
                  isNativeToken &&
                  !isOneOf(coin.chain, Object.values(UtxoBasedChain))
                ) {
                  const limitedMaxValue = fromChainAmount(
                    amount -
                      (chainSpecificQuery.data
                        ? getFeeAmount(chainSpecificQuery.data)
                        : BigInt(0)),
                    coin.decimals
                  )

                  maxValue = limitedMaxValue > 0 ? limitedMaxValue : 0
                }

                return (
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    gap={4}
                  >
                    {suggestions.map(suggestion => {
                      const suggestionBaseValue = maxValue * suggestion

                      const suggestionValue =
                        currencyInputMode === 'base'
                          ? suggestionBaseValue
                          : baseToFiat(suggestionBaseValue, coinPrice) || 0

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
                                : baseToFiat(suggestionBaseValue, coinPrice) ||
                                  0
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
                )
              }}
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
                    {`${fromChainAmount(amount, coin.decimals)} ${coin.ticker} `}
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
