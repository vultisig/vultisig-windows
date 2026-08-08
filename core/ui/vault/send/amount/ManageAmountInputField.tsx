import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { AmountInReverseCurrencyDisplay } from '@core/ui/vault/send/amount/AmountInReverseCurrencyDisplay'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { CurrencySwitch } from '@core/ui/vault/send/amount/AmountSwitch'
import { BaseSendAmountInput } from '@core/ui/vault/send/amount/BaseSendAmountInput'
import { FiatSendAmountInput } from '@core/ui/vault/send/amount/FiatSendAmountInput'
import { useSpendableSendAmount } from '@core/ui/vault/send/amount/useSpendableSendAmount'
import { AnimatedSendFormInputError } from '@core/ui/vault/send/components/AnimatedSendFormInputError'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { ManageDestinationTag } from '@core/ui/vault/send/memo/ManageDestinationTag'
import { ManageMemo } from '@core/ui/vault/send/memo/ManageMemo'
import { useSendFeeEstimateQuery } from '@core/ui/vault/send/queries/useSendFeeEstimateQuery'
import { useSendValidationQuery } from '@core/ui/vault/send/queries/useSendValidationQuery'
import { useSendAmount } from '@core/ui/vault/send/state/amount'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Match } from '@lib/ui/base/Match'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { AmountTextInputProps } from '@lib/ui/inputs/AmountTextInput'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useStateCorrector } from '@lib/ui/state/useStateCorrector'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { getMaxValue } from '@vultisig/core-chain/amount/getMaxValue'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { multiplyBigInt } from '@vultisig/lib-utils/bigint/bigIntMultiplyByNumber'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { minBigInt } from '@vultisig/lib-utils/math/minBigInt'
import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const suggestions = [0.25, 0.5, 0.75, 1]

export type CurrencyInputMode = 'base' | 'fiat'

export const ManageAmountInputField = () => {
  const { t } = useTranslation()

  const [value, setValue] = useSendAmount()
  const [pendingSuggestion, setPendingSuggestion] = useState<number | null>(
    null
  )

  const coin = useCurrentSendCoin()
  const coinPriceQuery = useCoinPriceQuery({ coin })
  const feeEstimateQuery = useSendFeeEstimateQuery()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const balance = balanceQuery.data
  const isNative = isFeeCoin(coin)

  // When user clicked a suggestion and we were waiting for fee: apply amount once fee is available
  useEffect(() => {
    if (
      pendingSuggestion == null ||
      balance == null ||
      (isNative && feeEstimateQuery.data == null)
    ) {
      return
    }

    const suggestionValue = multiplyBigInt(balance, pendingSuggestion)
    const maxSendable =
      isNative && feeEstimateQuery.data != null
        ? getMaxValue(balance, feeEstimateQuery.data)
        : balance
    const effectiveAmount = isNative
      ? minBigInt(suggestionValue, maxSendable)
      : suggestionValue

    setValue(effectiveAmount)
    setPendingSuggestion(null)
  }, [balance, feeEstimateQuery.data, isNative, pendingSuggestion, setValue])

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

  const { data } = useSendValidationQuery()
  const amountError = data?.amount

  const error = !!amountError && value ? amountError : undefined
  const isWaitingForFee =
    pendingSuggestion != null && isNative && feeEstimateQuery.isPending

  // Announced while the field still holds the typed amount — the write itself
  // happens on submit — so the user learns what will be sent before committing
  // to it rather than being surprised on Verify. Held back until the whole form
  // is clean, not just the amount: the fee this number is derived from is
  // estimated for the current receiver, so an invalid address leaves a stale
  // one behind. Pending validation still shows it, or it would flicker on every
  // keystroke.
  const spendableAmount = useSpendableSendAmount()
  const isFormClean = data === undefined || isRecordEmpty(data)
  const adjustedAmount =
    isFormClean && spendableAmount !== null && spendableAmount !== value
      ? formatAmount(fromChainAmount(spendableAmount, coin.decimals), coin)
      : null

  const sharedInputProps: Pick<
    AmountTextInputProps,
    'validation' | 'placeholder' | 'shouldBePositive' | 'disabled'
  > = useMemo(
    () => ({
      validation: error && !isWaitingForFee ? 'warning' : undefined,
      placeholder: isWaitingForFee ? t('loading') : t('enter_amount'),
      shouldBePositive: true,
      disabled: isWaitingForFee,
    }),
    [error, isWaitingForFee, t]
  )

  return (
    <SendInputContainer flexGrow>
      <HStack justifyContent="space-between" alignItems="center">
        <InputLabel>{t('amount')}</InputLabel>
      </HStack>
      <HorizontalLine />
      <VStack gap={8}>
        <HStack alignItems="flex-start" gap={4}>
          <VStack flexGrow gap={8}>
            <ActionInsideInteractiveElement
              render={() => (
                <InputWrapper>
                  <AnimatePresence mode="wait">
                    <StyledInputWrapper
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
                          <BaseSendAmountInput
                            validation={sharedInputProps.validation}
                            placeholder={sharedInputProps.placeholder}
                            disabled={sharedInputProps.disabled}
                            value={value}
                            onChange={setValue}
                            decimals={coin.decimals}
                          />
                        )}
                      />
                    </StyledInputWrapper>
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
                const suggestionValue =
                  balance != null ? multiplyBigInt(balance, suggestion) : 0n
                const maxSendable =
                  balance != null && isNative && feeEstimateQuery.data != null
                    ? getMaxValue(balance, feeEstimateQuery.data)
                    : (balance ?? 0n)
                const effectiveAmount =
                  balance != null
                    ? isNative
                      ? minBigInt(suggestionValue, maxSendable)
                      : suggestionValue
                    : 0n

                const handleSuggestionClick = () => {
                  if (balance == null) return

                  if (!isNative) {
                    setValue(suggestionValue)
                    setPendingSuggestion(null)
                    return
                  }

                  if (feeEstimateQuery.data != null) {
                    setValue(effectiveAmount)
                    setPendingSuggestion(null)
                  } else {
                    setPendingSuggestion(suggestion)
                  }
                }

                return (
                  <SuggestionOption
                    key={suggestion}
                    value={suggestion}
                    onClick={handleSuggestionClick}
                    isActive={value === effectiveAmount}
                  />
                )
              })}
            </HStack>
            {error && <AnimatedSendFormInputError error={error} />}
            {adjustedAmount !== null ? (
              <Text size={12} color="shy">
                {t('send_amount_adjusted_for_fee', { amount: adjustedAmount })}
              </Text>
            ) : null}
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
      <ManageDestinationTag />
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

const StyledInputWrapper = styled(motion.div)`
  padding-left: 40px;
  padding-right: 40px;
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
