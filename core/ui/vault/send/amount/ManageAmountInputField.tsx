import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { fromChainAmountNumber } from '@core/ui/chain/utils/fromChainAmountNumber'
import { ManageSendAllowDeath } from '@core/ui/vault/send/allowDeath/ManageSendAllowDeath'
import { useAllowDeathSendAmount } from '@core/ui/vault/send/allowDeath/useAllowDeathSendAmount'
import { useSendAllowDeath } from '@core/ui/vault/send/allowDeath/useSendAllowDeath'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { CurrencySwitch } from '@core/ui/vault/send/amount/AmountSwitch'
import { SendAmountFeeRow } from '@core/ui/vault/send/amount/SendAmountFeeRow'
import { useSendMaxSendable } from '@core/ui/vault/send/amount/useSendMaxSendable'
import { useSpendableSendAmount } from '@core/ui/vault/send/amount/useSpendableSendAmount'
import { AnimatedSendFormInputError } from '@core/ui/vault/send/components/AnimatedSendFormInputError'
import { ManageTonGaslessFee } from '@core/ui/vault/send/fee/tonGasless/ManageTonGaslessFee'
import { useIsSendFeePaidInCoin } from '@core/ui/vault/send/fee/useIsSendFeePaidInCoin'
import { ManageDestinationTag } from '@core/ui/vault/send/memo/ManageDestinationTag'
import { ManageMemo } from '@core/ui/vault/send/memo/ManageMemo'
import { useSendBalanceQuery } from '@core/ui/vault/send/queries/useSendBalanceQuery'
import { useSendFeeEstimateQuery } from '@core/ui/vault/send/queries/useSendFeeEstimateQuery'
import { useSendValidationQuery } from '@core/ui/vault/send/queries/useSendValidationQuery'
import { useSendAmount } from '@core/ui/vault/send/state/amount'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useStateCorrector } from '@lib/ui/state/useStateCorrector'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import {
  areEqualCoins,
  CoinKey,
  extractCoinKey,
} from '@vultisig/core-chain/coin/Coin'
import { multiplyBigInt } from '@vultisig/lib-utils/bigint/bigIntMultiplyByNumber'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { minBigInt } from '@vultisig/lib-utils/math/minBigInt'
import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CurrencyInputMode, currencySwitchWidthPx } from './currencyInputMode'
import { SendAmountCurrencyBlocks } from './SendAmountCurrencyBlocks'

const suggestions = [0.25, 0.5, 0.75, 1]

type SelectedSuggestion = {
  coin: CoinKey
  fraction: number
}

export const ManageAmountInputField = () => {
  const { t } = useTranslation()

  const [value, setValue] = useSendAmount()
  const [pendingSuggestion, setPendingSuggestion] = useState<number | null>(
    null
  )
  // The highlighted button is the one the user picked, not whichever
  // suggestion happens to resolve to the current amount: fee clamping makes
  // several fractions collapse onto the same value (75% and Max on a small
  // native balance), and on an empty balance every one of them is 0n. The
  // pick is tied to the coin it was made for and only shows while the field
  // still holds the amount it produced, so a coin switch (which keeps the
  // amount) does not carry a stale highlight.
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<SelectedSuggestion | null>(null)

  const coin = useCurrentSendCoin()
  const coinPriceQuery = useCoinPriceQuery({ coin })
  const [receiver] = useSendReceiver()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const balance = balanceQuery.data
  // The fee is reserved from this balance for a native send and for a gasless
  // TON jetton send, whose relay commission comes out of the jetton.
  const isNative = useIsSendFeePaidInCoin()
  const hasBalance = balance != null && balance > 0n
  const allowDeath = useSendAllowDeath()
  const { isSyncing: isAllowDeathSyncing } = useAllowDeathSendAmount()
  const {
    get: getMaxSendable,
    isPending: isMaxSendablePending,
    error: maxSendableError,
  } = useSendMaxSendable()
  const { data: sendFee } = useSendFeeEstimateQuery()
  const pendingMaxSendable =
    pendingSuggestion == null
      ? null
      : getMaxSendable(allowDeath.isEnabled && pendingSuggestion === 1)

  // Emptying the account is only ever done at the full amount: any other
  // amount could leave a remainder the chain destroys, so choosing one turns
  // the option off.
  const handleAmountChange = (amount: bigint | null) => {
    setValue(amount)
    setPendingSuggestion(null)
    setSelectedSuggestion(null)
    if (allowDeath.isEnabled) {
      allowDeath.setEnabled(false)
    }
  }

  // When user clicked a suggestion and we were waiting for the maximum: apply amount once it is known
  useEffect(() => {
    if (
      pendingSuggestion == null ||
      balance == null ||
      (isNative && pendingMaxSendable == null)
    ) {
      return
    }

    const suggestionValue = multiplyBigInt(balance, pendingSuggestion)
    const effectiveAmount =
      isNative && pendingMaxSendable != null
        ? minBigInt(suggestionValue, pendingMaxSendable)
        : suggestionValue

    setValue(effectiveAmount)
    setPendingSuggestion(null)
  }, [balance, isNative, pendingMaxSendable, pendingSuggestion, setValue])

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

  // Switching from a focused amount field hands focus to the other field.
  const amountBlocksRef = useRef<HTMLDivElement>(null)
  const movesFocusOnSwitchRef = useRef(false)

  const switchCurrencyInputMode = (mode: CurrencyInputMode) => {
    movesFocusOnSwitchRef.current =
      amountBlocksRef.current?.contains(document.activeElement) === true
    setCurrencyInputMode(mode)
  }

  useEffect(() => {
    if (!movesFocusOnSwitchRef.current) return

    movesFocusOnSwitchRef.current = false
    amountBlocksRef.current
      ?.querySelector<HTMLInputElement>(
        `[data-currency-block="${currencyInputMode}"] input`
      )
      ?.focus()
  }, [currencyInputMode])

  const { data } = useSendValidationQuery()
  const amountError = data?.amount

  const error = !!amountError && value ? amountError : undefined
  // The fee is estimated for a concrete receiver, so without one the query
  // stays idle and never settles. Waiting on it would lock the field for good,
  // and any fee kept from a previous receiver is stale.
  const isReceiverMissing = !receiver
  // Once the fee alone takes the whole balance every suggestion comes out as
  // 0, so say why instead of letting the buttons look broken. Compared against
  // the fee itself rather than a zero maximum: NEAR's maximum also holds back
  // the storage reserve, which is a different reason.
  const isFeeAboveBalance =
    isNative &&
    !isReceiverMissing &&
    balance != null &&
    balance > 0n &&
    sendFee != null &&
    balance <= sendFee
  const suggestionsUnavailableReason = (() => {
    if (!hasBalance || !isNative) return null
    if (isReceiverMissing) return t('send_enter_address_first_for_percentage')
    if (maxSendableError) return extractErrorMsg(maxSendableError)
    if (isFeeAboveBalance) return t('send_insufficient_balance_for_fee')
    return null
  })()
  const isWaitingForFee =
    (pendingSuggestion != null &&
      isNative &&
      !isReceiverMissing &&
      isMaxSendablePending) ||
    isAllowDeathSyncing

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
    isFormClean &&
    !isAllowDeathSyncing &&
    spendableAmount !== null &&
    spendableAmount !== value
      ? formatAmount(fromChainAmount(spendableAmount, coin.decimals), coin)
      : null

  const sharedInputProps = {
    isWarning: !!error && !isWaitingForFee,
    placeholder: isWaitingForFee ? t('loading') : amountPlaceholder,
    disabled: isWaitingForFee,
  }

  return (
    <AmountCard>
      <HStack alignItems="center" gap={4}>
        <ChainEntityIcon
          value={getChainLogoSrc(coin.chain)}
          style={{ fontSize: 16 }}
        />
        <Text size={14} weight={500} color="contrast">
          {getChainDisplayName(coin.chain)}
        </Text>
      </HStack>
      <HStack alignItems="center" gap={8}>
        <MatchQuery value={coinPriceQuery} success={() => <SwitchSpacer />} />
        <SendAmountCurrencyBlocks
          ref={amountBlocksRef}
          mode={currencyInputMode}
          inputProps={sharedInputProps}
          value={value}
          onChange={handleAmountChange}
        />
        <MatchQuery
          value={coinPriceQuery}
          success={() => (
            <CurrencySwitch
              value={currencyInputMode}
              onClick={switchCurrencyInputMode}
            />
          )}
        />
      </HStack>
      {error && <AnimatedSendFormInputError error={error} />}
      {!error && isFeeAboveBalance ? (
        <AnimatedSendFormInputError
          error={t('send_insufficient_balance_for_fee')}
        />
      ) : null}
      {!error && !isFeeAboveBalance && suggestionsUnavailableReason !== null ? (
        <Text size={12} color="shy">
          {suggestionsUnavailableReason}
        </Text>
      ) : null}
      {adjustedAmount !== null ? (
        <Text size={12} color="shy">
          {t('send_amount_adjusted_for_fee', { amount: adjustedAmount })}
        </Text>
      ) : null}
      <HStack justifyContent="space-between" alignItems="center" gap={4}>
        {suggestions.map(suggestion => {
          const suggestionValue =
            balance != null ? multiplyBigInt(balance, suggestion) : 0n
          const maxSendable = isNative
            ? getMaxSendable(allowDeath.isEnabled && suggestion === 1)
            : null
          const effectiveAmount =
            balance != null
              ? maxSendable != null
                ? minBigInt(suggestionValue, maxSendable)
                : suggestionValue
              : 0n

          const handleSuggestionClick = () => {
            if (balance == null) return

            if (allowDeath.isEnabled && suggestion !== 1) {
              allowDeath.setEnabled(false)
            }

            setSelectedSuggestion({
              coin: extractCoinKey(coin),
              fraction: suggestion,
            })

            if (!isNative) {
              setValue(suggestionValue)
              setPendingSuggestion(null)
              return
            }

            if (maxSendable != null) {
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
              disabled={!hasBalance || suggestionsUnavailableReason !== null}
              isActive={
                (allowDeath.isEnabled && suggestion === 1) ||
                (selectedSuggestion !== null &&
                  selectedSuggestion.fraction === suggestion &&
                  areEqualCoins(selectedSuggestion.coin, coin) &&
                  value === effectiveAmount)
              }
            />
          )
        })}
      </HStack>
      <MatchQuery
        value={balanceQuery}
        success={amount => (
          <TotalBalanceWrapper
            justifyContent="space-between"
            alignItems="center"
            data-testid="send-available-balance"
          >
            <Text as="span" size={14} color="contrast">
              {t('balance_available')}:
            </Text>{' '}
            <Text size={14}>
              {`${fromChainAmountNumber({ amount, decimals: coin.decimals })} ${coin.ticker} `}
            </Text>
          </TotalBalanceWrapper>
        )}
      />
      <ManageMemo />
      <ManageDestinationTag />
      <ManageTonGaslessFee />
      <ManageSendAllowDeath />
      <LineSeparator kind="regular" />
      <SendAmountFeeRow />
    </AmountCard>
  )
}

const amountPlaceholder = '0'

const AmountCard = styled(VStack)`
  gap: 16px;
  padding: 16px;
  ${borderRadius.xl};
  border: 1px solid ${getColor('foregroundExtra')};
`

const SwitchSpacer = styled.div`
  flex-shrink: 0;
  width: ${currencySwitchWidthPx}px;
`

const TotalBalanceWrapper = styled(HStack)`
  background-color: ${getColor('foreground')};
  padding: 16px;
  ${borderRadius.md}
`

const SuggestionOption = styled(AmountSuggestion)`
  flex: 1;
  padding: 6px 18px;
  ${borderRadius.pill};
`
