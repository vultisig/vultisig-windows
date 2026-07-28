import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import {
  LimitSwapExpiryHours,
  limitSwapExpiryHours,
} from '@vultisig/core-chain/swap/native/limitSwapMemo'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { LimitAssetStep } from '../limit/LimitAssetStep'
import { LimitAssetSummary } from '../limit/LimitAssetSummary'
import { LimitExecuteWhen, LimitPriceUnit } from '../limit/LimitExecuteWhen'
import { LimitExecuteWhenCollapsed } from '../limit/LimitExecuteWhenCollapsed'
import { LimitOrderReviewData } from '../limit/LimitOrderReview'
import { LimitSwapNotice } from '../limit/LimitSwapNotice'
import {
  buildLimitSwapMemoForCoins,
  getLimitSwapExpectedToAmount,
  getLimitSwapReceiveAmount,
} from '../limit/memo'
import { getLimitOrderBlocker, LimitOrderBlocker } from '../limit/placement'
import {
  getLimitPriceWarning,
  getPresetPrice,
  LimitPricePreset,
  limitPricePresets,
  LimitPriceWarning,
  parseLimitPrice,
  quantizeTargetPrice,
} from '../limit/price'
import { useAdvancedSwapQueueEnabledQuery } from '../limit/queries/useAdvancedSwapQueueEnabledQuery'
import { useLimitMarketPriceQuery } from '../limit/queries/useLimitMarketPriceQuery'
import { useLimitSwapSupportedChainsQuery } from '../limit/queries/useLimitSwapSupportedChainsQuery'
import {
  fiatUnitPriceToRate,
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

export const LimitSwapForm: FC<OnFinishProp<LimitOrderReviewData>> = ({
  onFinish,
}) => {
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

  // The entered price is meaningless without the exact pair it was typed
  // against (fiat mode divides by the sell coin's price; asset mode is
  // sell-per-buy for this pair), so clear it whenever the pair changes —
  // including via the reverse button — rather than carrying a stale value into
  // the new pair.
  const pairKey = `${coinKeyToString(fromCoinKey)}>${coinKeyToString(toCoinKey)}`
  useEffect(() => {
    setPriceInput('')
  }, [pairKey])

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
  const rawRate = (() => {
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

  // Quantize to the memo's representable precision: a rate from a division has
  // more fractional digits than the 8 the memo can encode, and the SDK builder
  // rejects the excess. Doing it here keeps the displayed price, receive amount,
  // and signed LIM all agreeing on the value the memo will hold.
  const rate = rawRate === null ? null : quantizeTargetPrice(rawRate)

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
      // toFixed keeps plain decimal notation (a Number round-trip would emit
      // "1e-8" for tiny values, which parseLimitPrice then rejects); strip the
      // trailing zeros it pads.
      setPriceInput(next.toFixed(8).replace(/\.?0+$/, ''))
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
  const memoValue = memo && 'data' in memo ? memo.data : undefined

  const blockerMessage: Record<LimitOrderBlocker, string> = {
    queueUnavailable: t('swap_limit_unavailable'),
    pairNotRoutable: t('swap_limit_blocker_pair_not_routable'),
    chainUnavailable: t('swap_limit_blocker_chain_unavailable'),
    sameAsset: t('swap_limit_blocker_same_asset'),
    noAmount: t('swap_limit_blocker_no_amount'),
    insufficientBalance: t('swap_limit_blocker_insufficient_balance'),
    noPrice: t('swap_limit_blocker_no_price'),
    noMarketPrice: t('swap_limit_blocker_no_market_price'),
    noDestination: t('swap_limit_blocker_no_destination'),
    memoInvalid: t('swap_limit_blocker_memo_invalid'),
  }

  const warningMessage: Record<LimitPriceWarning, string> = {
    atOrBelowMarket: t('swap_limit_warning_at_or_below_market'),
    farAboveMarket: t('swap_limit_warning_far_above_market'),
  }

  // The memo's LIM in THORChain's 1e8 fixed point, for the co-signer display on
  // the keysign payload — kept as a bigint so no precision is lost into signing.
  const expectedToAmountResult =
    rate !== null && amount !== null && amount > 0n
      ? attempt(() =>
          getLimitSwapExpectedToAmount({
            fromCoin,
            amount,
            targetPrice: rate,
          })
        )
      : undefined

  // `Result`'s failure variant types `data` as `never?`, so `'data' in result`
  // does not narrow — coerce explicitly rather than trusting the check.
  const expectedToAmount: bigint | null =
    expectedToAmountResult && 'data' in expectedToAmountResult
      ? (expectedToAmountResult.data ?? null)
      : null

  // Same class of failure as the memo not building — the order can't be
  // expressed — so it blocks placement through the same reason rather than
  // leaving the CTA enabled over a `placeOrder` that would return silently.
  const expectedToAmountError =
    expectedToAmountResult && 'error' in expectedToAmountResult
      ? extractErrorMsg(expectedToAmountResult.error)
      : undefined

  // Both mean "this order can't be expressed", so they share the blocker and
  // the notice — the notice needs the specific text, since the generic
  // memo-invalid string wouldn't tell the user what to change.
  const orderExpressionError = memoError ?? expectedToAmountError

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
    destinationAddress: toCoin.address,
    memoError: orderExpressionError,
  })

  // Which preset (if any) the current rate corresponds to, so its pill reads as
  // selected. Compared after quantizing both sides, since that is the precision
  // a preset click actually writes.
  const activePreset: LimitPricePreset | undefined =
    rate !== null && marketRate
      ? limitPricePresets.find(
          preset =>
            quantizeTargetPrice(
              getPresetPrice({ marketPrice: marketRate, preset })
            ) === rate
        )
      : undefined

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

  // The receive amount is the memo's truncated LIM, not amount x rate: showing a
  // "you receive" figure the signed order would not honor is the mismatch the
  // issue calls out. `getLimitSwapReceiveAmount` throws on the same conditions as
  // the memo (a LIM flooring to zero), so it is guarded the same way.
  const receiveAmount =
    rate !== null && amount !== null && amount > 0n
      ? withFallback(
          attempt(() =>
            getLimitSwapReceiveAmount({ fromCoin, amount, targetPrice: rate })
          ),
          null
        )
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

  // Fiat price of one buy unit, only when the (ungated, independently-loaded)
  // fiat query has actually resolved — a `?? 0` here would show "$0.00" as the
  // target price instead of falling back to the asset ratio.
  const targetFiatPrice =
    rate !== null
      ? rateToFiatUnitPrice({ rate, sellCoinFiatPrice: fromCoinFiatPrice })
      : null
  // Always the asset ratio (sell units per buy unit), never `$`-prefixed, so it
  // is a correct fallback regardless of the live unit toggle.
  const targetAssetPrice = rate !== null ? rateToUnitPrice({ rate }) : null

  // Hand off through the page-level flow (like the market form) so the review
  // screen replaces the whole form — header and Market/Limit tabs included —
  // rather than nesting a second header under them. The button is only enabled
  // when there is no blocker, which guarantees these are present; the guard
  // narrows the types.
  const placeOrder = () => {
    if (
      amount === null ||
      memoValue === undefined ||
      expectedToAmount === null
    ) {
      return
    }

    onFinish({
      fromCoin,
      toCoin,
      sellAmount: sellAmount ?? 0,
      sellChainAmount: amount,
      receiveAmount: receiveAmount ?? 0,
      expectedToAmount,
      memo: memoValue,
      unitPrice:
        targetAssetPrice !== null
          ? `${formatNumber(targetAssetPrice)} ${fromCoin.ticker}`
          : undefined,
      targetPriceLabel:
        targetFiatPrice !== null
          ? `$${formatNumber(targetFiatPrice, 2)}`
          : undefined,
      expiryHours,
    })
  }

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
              activePreset={activePreset}
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
                  blocker === 'memoInvalid' && orderExpressionError
                    ? orderExpressionError
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

      <Button
        onClick={placeOrder}
        disabled={Boolean(blocker)}
        data-testid="limit-place-order"
      >
        {t('swap_limit_place_order')}
      </Button>
    </PageContent>
  )
}
