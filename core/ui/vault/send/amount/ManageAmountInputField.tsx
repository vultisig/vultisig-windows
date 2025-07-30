import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { UtxoBasedChain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { AmountInReverseCurrencyDisplay } from '@core/ui/vault/send/amount/AmountInReverseCurrencyDisplay'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { CurrencySwitch } from '@core/ui/vault/send/amount/AmountSwitch'
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
import { Match } from '@lib/ui/base/Match'
import { borderRadius } from '@lib/ui/css/borderRadius'
import {
  AmountTextInput,
  AmountTextInputProps,
} from '@lib/ui/inputs/AmountTextInput'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { useStateCorrector } from '@lib/ui/state/useStateCorrector'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useSendAmount } from '../state/amount'
import { FiatSendAmountInput } from './FiatSendAmountInput'

const suggestions = [0.25, 0.5, 0.75, 1]

export type CurrencyInputMode = 'base' | 'fiat'

export const ManageAmountInputField = () => {
  const { t } = useTranslation()

  const [value, setValue] = useSendAmount()

  const coin = useCurrentSendCoin()
  const coinPriceQuery = useCoinPriceQuery({ coin })

  const [currencyInputMode, setCurrencyInputMode] = useStateCorrector(
    useState<CurrencyInputMode>('base'),
    useCallback(
      value => {
        if (!coinPriceQuery.data) {
          return 'base'
        }

        return value
      },
      [coinPriceQuery.data]
    )
  )

  const [
    {
      errors: { amount: amountError },
    },
  ] = useSendFormFieldState()

  const chainSpecificQuery = useSendChainSpecificQuery()

  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  const maxAmountQuery = useTransformQueriesData(
    {
      chainSpecific: chainSpecificQuery,
      balance: balanceQuery,
    },
    ({ balance, chainSpecific }) => {
      if (
        balance > 0n &&
        isFeeCoin(coin) &&
        !isOneOf(coin.chain, Object.values(UtxoBasedChain))
      ) {
        const feeAmount = getFeeAmount(chainSpecific)
        return feeAmount > balance ? 0n : balance - feeAmount
      }

      return balance
    }
  )

  const error = !!amountError && value ? amountError : undefined

  const sharedInputProps: Pick<
    AmountTextInputProps,
    'validation' | 'placeholder' | 'shouldBePositive'
  > = useMemo(
    () => ({
      validation: error ? 'warning' : undefined,
      placeholder: t('enter_amount'),
      shouldBePositive: true,
    }),
    [error, t]
  )

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
                      <Match
                        value={currencyInputMode}
                        fiat={() => (
                          <FiatSendAmountInput
                            {...sharedInputProps}
                            value={value}
                            onChange={setValue}
                            decimals={coin.decimals}
                            price={shouldBePresent(coinPriceQuery.data)}
                          />
                        )}
                        base={() => (
                          <AmountTextInput
                            {...sharedInputProps}
                            value={
                              value === null
                                ? value
                                : fromChainAmount(value, coin.decimals)
                            }
                            onValueChange={value => {
                              setValue(
                                value === null
                                  ? value
                                  : toChainAmount(value, coin.decimals)
                              )
                            }}
                          />
                        )}
                      />
                    </motion.div>
                  </AnimatePresence>
                  <AmountInReverseCurrencyDisplay value={currencyInputMode} />
                </InputWrapper>
              )}
              action={
                <MatchQuery
                  value={coinPriceQuery}
                  success={() => (
                    <HStack gap={8}>
                      <CurrencySwitch
                        value={currencyInputMode}
                        onClick={value => setCurrencyInputMode(value)}
                      />
                    </HStack>
                  )}
                />
              }
              actionPlacerStyles={{
                right: 0,
                bottom: 55,
              }}
            />
            <HStack justifyContent="space-between" alignItems="center" gap={4}>
              {suggestions.map(suggestion => {
                const getProps = () => {
                  const { data } = maxAmountQuery
                  if (!data) {
                    return {}
                  }
                  const suggestionValue = BigInt(
                    Math.round(Number(data) * suggestion)
                  )

                  return {
                    onClick: () => {
                      setValue(suggestionValue)
                    },
                    isActive: value === suggestionValue,
                  }
                }

                return (
                  <SuggestionOption
                    {...getProps()}
                    key={suggestion}
                    value={suggestion}
                  />
                )
              })}
            </HStack>
            {error && <AnimatedSendFormInputError error={error} />}
            <MatchQuery
              value={balanceQuery}
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
