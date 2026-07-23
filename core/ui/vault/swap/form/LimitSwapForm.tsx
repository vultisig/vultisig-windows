import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import {
  LimitSwapExpiryHours,
  limitSwapExpiryHours,
} from '@vultisig/core-chain/swap/native/limitSwapMemo'
import { attempt } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { LimitAssetStep } from '../limit/LimitAssetStep'
import { LimitAssetSummary } from '../limit/LimitAssetSummary'
import { LimitExecuteWhen, LimitPriceUnit } from '../limit/LimitExecuteWhen'
import { LimitExecuteWhenCollapsed } from '../limit/LimitExecuteWhenCollapsed'
import { LimitSwapNotice } from '../limit/LimitSwapNotice'
import { buildLimitSwapMemoForCoins } from '../limit/memo'
import { getLimitOrderBlocker, LimitOrderBlocker } from '../limit/placement'
import {
  getLimitPriceWarning,
  getPresetPrice,
  LimitPriceWarning,
  parseLimitPrice,
} from '../limit/price'
import { useAdvancedSwapQueueEnabledQuery } from '../limit/queries/useAdvancedSwapQueueEnabledQuery'
import { useLimitMarketPriceQuery } from '../limit/queries/useLimitMarketPriceQuery'
import { useLimitSwapSupportedChainsQuery } from '../limit/queries/useLimitSwapSupportedChainsQuery'
import {
  fiatUnitPriceToRate,
  getReceiveAmount,
  rateToFiatUnitPrice,
  rateToUnitPrice,
  unitPriceToRate,
} from '../limit/rate'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

const defaultExpiryHours: LimitSwapExpiryHours = limitSwapExpiryHours[1]

const formatNumber = (value: number, maximumFractionDigits = 8) =>
  value.toLocaleString(undefined, { maximumFractionDigits })

export const LimitSwapForm = () => {
  const { t } = useTranslation()

  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)
  const [amount] = useFromAmount()

  const [step, setStep] = useState<'asset' | 'execute'>('asset')
  const [priceInput, setPriceInput] = useState('')
  const [unit, setUnit] = useState<LimitPriceUnit>('fiat')
  const [expiryHours, setExpiryHours] =
    useState<LimitSwapExpiryHours>(defaultExpiryHours)

  const { data: isQueueEnabled } = useAdvancedSwapQueueEnabledQuery()
  const { data: supportedChains } = useLimitSwapSupportedChainsQuery()
  const { data: marketRate } = useLimitMarketPriceQuery({ fromCoin, toCoin })
  const { data: balance } = useBalanceQuery(extractAccountCoinKey(fromCoin))
  const { data: fromCoinFiatPrice } = useCoinPriceQuery({ coin: fromCoinKey })

  // The rate (buy units per sell unit) is authoritative -- it is what the memo's
  // LIM encodes. Fiat entry converts into it once, here, rather than being
  // stored and re-derived at signing where a drifting feed could move it.
  const sellAmount =
    amount !== null ? fromChainAmount(amount, fromCoin.decimals) : null

  const entered = parseLimitPrice(priceInput)
  const rate = (() => {
    if (entered === null) {
      return null
    }

    // Both modes express the price of ONE buy unit -- in fiat, or in sell-asset
    // units ("1 ETH = 0.02 BTC"). Only the unit differs, never the meaning.
    if (unit === 'fiat') {
      return fiatUnitPriceToRate({
        fiatUnitPrice: entered,
        sellCoinFiatPrice: fromCoinFiatPrice,
      })
    }

    return unitPriceToRate({ unitPrice: entered })
  })()

  const toInputValue = (forRate: number, forUnit: LimitPriceUnit) =>
    forUnit === 'fiat'
      ? rateToFiatUnitPrice({
          rate: forRate,
          sellCoinFiatPrice: fromCoinFiatPrice,
        })
      : rateToUnitPrice({ rate: forRate })

  const setPriceFromRate = (nextRate: number, forUnit: LimitPriceUnit) => {
    const next = toInputValue(nextRate, forUnit)

    if (next !== null) {
      setPriceInput(String(Number(next.toFixed(8))))
    }
  }

  // Switching units re-expresses the same rate rather than clearing it, so the
  // order the user composed survives the toggle.
  const handleUnitChange = (nextUnit: LimitPriceUnit) => {
    if (nextUnit !== unit) {
      if (rate !== null) {
        setPriceFromRate(rate, nextUnit)
      }
      setUnit(nextUnit)
    }
  }

  const memo =
    rate !== null && amount !== null && amount > 0n
      ? attempt(() =>
          buildLimitSwapMemoForCoins({
            fromCoin,
            toCoin,
            amount,
            targetPrice: rate,
            expiryHours,
            destinationAddress: toCoin.address,
          })
        )
      : undefined

  const memoError =
    memo && 'error' in memo ? extractErrorMsg(memo.error) : undefined

  const blockerMessage: Record<LimitOrderBlocker, string> = {
    queueUnavailable: t('swap_limit_unavailable'),
    pairNotRoutable: t('swap_limit_blocker_pair_not_routable'),
    chainUnavailable: t('swap_limit_blocker_chain_unavailable'),
    sameAsset: t('swap_limit_blocker_same_asset'),
    noAmount: t('swap_limit_blocker_no_amount'),
    insufficientBalance: t('swap_limit_blocker_insufficient_balance'),
    noPrice: t('swap_limit_blocker_no_price'),
    noMarketPrice: t('swap_limit_blocker_no_market_price'),
    memoInvalid: t('swap_limit_blocker_memo_invalid'),
  }

  const warningMessage: Record<LimitPriceWarning, string> = {
    atOrBelowMarket: t('swap_limit_warning_at_or_below_market'),
    farAboveMarket: t('swap_limit_warning_far_above_market'),
  }

  const blocker = getLimitOrderBlocker({
    fromChain: fromCoin.chain,
    toChain: toCoin.chain,
    isSameAsset: areEqualCoins(fromCoinKey, toCoinKey),
    amount,
    balance,
    price: rate,
    isQueueEnabled,
    supportedChains,
    marketPrice: marketRate,
    memoError,
  })

  const priceWarning =
    rate !== null
      ? getLimitPriceWarning({ price: rate, marketPrice: marketRate })
      : undefined

  const formatUnitPrice = (value: number) =>
    unit === 'fiat'
      ? `$${formatNumber(value, 2)}`
      : `${formatNumber(value)} ${fromCoin.ticker}`

  const marketUnitPrice = marketRate
    ? unit === 'fiat'
      ? rateToFiatUnitPrice({
          rate: marketRate,
          sellCoinFiatPrice: fromCoinFiatPrice,
        })
      : rateToUnitPrice({ rate: marketRate })
    : null

  const receiveAmount =
    rate !== null && sellAmount !== null
      ? getReceiveAmount({ sellAmount, rate })
      : null

  const secondaryLabel = (() => {
    if (unit === 'fiat') {
      return receiveAmount !== null
        ? `${formatNumber(receiveAmount)} ${toCoin.ticker}`
        : undefined
    }

    const fiat =
      rate !== null
        ? rateToFiatUnitPrice({ rate, sellCoinFiatPrice: fromCoinFiatPrice })
        : null

    return fiat !== null ? `$${formatNumber(fiat, 2)}` : undefined
  })()

  return (
    <PageContent gap={12} justifyContent="space-between" scrollable>
      <VStack gap={12}>
        {step === 'asset' ? (
          <>
            <LimitAssetStep />
            <LimitExecuteWhenCollapsed onExpand={() => setStep('execute')} />
          </>
        ) : (
          <>
            <LimitAssetSummary
              fromCoin={fromCoin}
              toCoin={toCoin}
              onEdit={() => setStep('asset')}
            />
            <LimitExecuteWhen
              toCoin={toCoin}
              priceInput={priceInput}
              onPriceInputChange={setPriceInput}
              unit={unit}
              onUnitChange={handleUnitChange}
              valueSuffix={unit === 'fiat' ? undefined : fromCoin.ticker}
              valuePrefix={unit === 'fiat' ? '$' : undefined}
              secondaryLabel={secondaryLabel}
              marketLabel={
                marketUnitPrice !== null
                  ? formatUnitPrice(marketUnitPrice)
                  : undefined
              }
              hasMarketPrice={Boolean(marketRate)}
              onPresetSelect={preset => {
                if (marketRate) {
                  setPriceFromRate(
                    getPresetPrice({ marketPrice: marketRate, preset }),
                    unit
                  )
                }
              }}
              expiryHours={expiryHours}
              onExpiryChange={setExpiryHours}
            />
            {blocker ? (
              <LimitSwapNotice
                kind="blocker"
                message={
                  blocker === 'memoInvalid' && memoError
                    ? memoError
                    : blockerMessage[blocker]
                }
              />
            ) : priceWarning ? (
              <LimitSwapNotice
                kind="warning"
                message={warningMessage[priceWarning]}
              />
            ) : null}
          </>
        )}
      </VStack>

      <VStack gap={12}>
        {/* Signing needs the SDK's limit keysign payload builder, which is not in
            a published release yet. Everything up to the signed memo is live. */}
        <Text size={12} color="shy">
          {t('swap_limit_place_pending_signing')}
        </Text>
        <Button disabled data-testid="limit-place-order">
          {t('swap_limit_place_order')}
        </Button>
      </VStack>
    </PageContent>
  )
}
