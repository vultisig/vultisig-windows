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
import {
  getLimitBlockerNotice,
  getLimitOrderBlocker,
  getLimitPairBlocker,
  LimitOrderBlocker,
} from '../limit/placement'
import {
  getLimitPriceWarning,
  getPresetPrice,
  LimitPricePreset,
  LimitPriceWarning,
  parseLimitPrice,
  quantizeTargetPrice,
} from '../limit/price'
import { useAdvancedSwapQueueEnabledQuery } from '../limit/queries/useAdvancedSwapQueueEnabledQuery'
import { useLimitMarketPriceQuery } from '../limit/queries/useLimitMarketPriceQuery'
import { useLimitSwapSupportedChainsQuery } from '../limit/queries/useLimitSwapSupportedChainsQuery'
import { rateToSellUnitFiatValue, sellUnitFiatValueToRate } from '../limit/rate'
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
  const [activePreset, setActivePreset] = useState<LimitPricePreset>()
  const [unit, setUnit] = useState<LimitPriceUnit>('fiat')
  const [expiryHours, setExpiryHours] =
    useState<LimitSwapExpiryHours>(defaultExpiryHours)

  // The entered price is meaningless without the exact pair it was typed
  // against (fiat mode anchors on the buy coin's price; asset mode is the
  // buy-per-sell rate for this pair), so clear it whenever the pair changes —
  // including via the reverse button — rather than carrying a stale value into
  // the new pair.
  const pairKey = `${coinKeyToString(fromCoinKey)}>${coinKeyToString(toCoinKey)}`
  useEffect(() => {
    setPriceInput('')
    setActivePreset(undefined)
  }, [pairKey])

  const { data: isQueueEnabled } = useAdvancedSwapQueueEnabledQuery()
  const { data: supportedChains } = useLimitSwapSupportedChainsQuery()
  const { data: marketRate, isFetching: isMarketPriceLoading } =
    useLimitMarketPriceQuery({ fromCoin, toCoin })
  const { data: balance } = useBalanceQuery(extractAccountCoinKey(fromCoin))
  // The full vault coin, not the bare view-state key: the price query resolves
  // a fiat price through the coin's priceProviderId, which the key lacks — with
  // the key alone the query errors and fiat mode (entry, presets, market label)
  // silently dies.
  const { data: toCoinFiatPrice } = useCoinPriceQuery({ coin: toCoin })

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

    // Both modes express what ONE sell unit is worth -- in buy-asset units
    // ("When 1 ETH is worth 0.02 BTC", the rate itself) or in fiat. Only the
    // unit differs, never the meaning.
    if (unit === 'fiat') {
      return sellUnitFiatValueToRate({
        fiatValue: entered,
        buyCoinFiatPrice: toCoinFiatPrice,
      })
    }

    return entered
  })()

  // Quantize to the memo's representable precision: a rate from a division has
  // more fractional digits than the 8 the memo can encode, and the SDK builder
  // rejects the excess. Doing it here keeps the displayed price, receive amount,
  // and signed LIM all agreeing on the value the memo will hold.
  const rate = rawRate === null ? null : quantizeTargetPrice(rawRate)

  type ToInputValueInput = {
    forRate: number
    forUnit: LimitPriceUnit
  }

  const toInputValue = ({ forRate, forUnit }: ToInputValueInput) =>
    forUnit === 'fiat'
      ? rateToSellUnitFiatValue({
          rate: forRate,
          buyCoinFiatPrice: toCoinFiatPrice,
        })
      : forRate

  type SetPriceFromRateInput = {
    nextRate: number
    forUnit: LimitPriceUnit
  }

  // Returns whether the input was actually populated, so callers don't mark
  // state (like an active preset) for a price that never made it into the field
  // — fiat conversion can fail while the fiat price is still loading.
  const setPriceFromRate = ({ nextRate, forUnit }: SetPriceFromRateInput) => {
    const next = toInputValue({ forRate: nextRate, forUnit })

    if (next === null) {
      return false
    }

    // toFixed keeps plain decimal notation (a Number round-trip would emit
    // "1e-8" for tiny values, which parseLimitPrice then rejects); strip the
    // trailing zeros it pads.
    setPriceInput(next.toFixed(8).replace(/\.?0+$/, ''))
    return true
  }

  // Switching units re-expresses the same rate rather than clearing it, so the
  // order the user composed survives the toggle.
  const handleUnitChange = (nextUnit: LimitPriceUnit) => {
    if (nextUnit !== unit) {
      if (rate !== null) {
        setPriceFromRate({ nextRate: rate, forUnit: nextUnit })
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

  const pairInput = {
    fromChain: fromCoin.chain,
    toChain: toCoin.chain,
    isSameAsset: areEqualCoins(fromCoinKey, toCoinKey),
    isQueueEnabled,
    supportedChains,
    marketPrice: marketRate,
    destinationAddress: toCoin.address,
  }

  const blocker = getLimitOrderBlocker({
    ...pairInput,
    amount,
    balance,
    price: rate,
    memoError: orderExpressionError,
  })

  // The asset step answers only what the pair itself decides, so it can say
  // "this pair cannot be traded" the moment the pair is picked rather than
  // asking for an amount and a price first — the whole point of showing it
  // here. Both steps route their message through the same notice filter, so a
  // gate that has not answered yet never speaks for one.
  const noticeInput = {
    isQueueEnabled,
    supportedChains,
    balance,
    isMarketPriceLoading,
  }
  const pairNotice = getLimitBlockerNotice({
    ...noticeInput,
    blocker: getLimitPairBlocker(pairInput),
  })
  const orderNotice = getLimitBlockerNotice({ ...noticeInput, blocker })

  const priceWarning =
    rate !== null
      ? getLimitPriceWarning({ price: rate, marketPrice: marketRate })
      : undefined

  const formatDisplayPrice = (value: number) =>
    unit === 'fiat'
      ? `$${formatNumber(value, 2)}`
      : `${formatNumber(value)} ${toCoin.ticker}`

  const marketDisplayPrice = marketRate
    ? unit === 'fiat'
      ? rateToSellUnitFiatValue({
          rate: marketRate,
          buyCoinFiatPrice: toCoinFiatPrice,
        })
      : marketRate
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

  // The secondary line mirrors the same unit price in the other unit, so both
  // readings of the order's trigger stay visible at once.
  const secondaryLabel = (() => {
    if (unit === 'fiat') {
      return rate !== null
        ? `${formatNumber(rate)} ${toCoin.ticker}`
        : undefined
    }

    const fiat =
      rate !== null
        ? rateToSellUnitFiatValue({ rate, buyCoinFiatPrice: toCoinFiatPrice })
        : null

    return fiat !== null ? `$${formatNumber(fiat, 2)}` : undefined
  })()

  // Fiat value of one sell unit, only when the (ungated, independently-loaded)
  // fiat query has actually resolved — a `?? 0` here would show "$0.00" as the
  // target price instead of falling back to the asset rate.
  const targetFiatPrice =
    rate !== null
      ? rateToSellUnitFiatValue({ rate, buyCoinFiatPrice: toCoinFiatPrice })
      : null

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
        rate !== null ? `${formatNumber(rate)} ${toCoin.ticker}` : undefined,
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
            {pairNotice ? (
              <LimitSwapNotice
                kind="blocker"
                message={blockerMessage[pairNotice]}
              />
            ) : null}
          </>
        ) : (
          <>
            <LimitAssetSummary
              fromCoin={fromCoin}
              toCoin={toCoin}
              onEdit={() => setStep('asset')}
            />
            <LimitExecuteWhen
              fromCoin={fromCoin}
              priceInput={priceInput}
              onPriceInputChange={value => {
                setPriceInput(value)
                setActivePreset(undefined)
              }}
              unit={unit}
              onUnitChange={handleUnitChange}
              valueSuffix={unit === 'fiat' ? undefined : toCoin.ticker}
              valuePrefix={unit === 'fiat' ? '$' : undefined}
              secondaryLabel={secondaryLabel}
              marketLabel={
                marketDisplayPrice !== null
                  ? formatDisplayPrice(marketDisplayPrice)
                  : undefined
              }
              hasMarketPrice={Boolean(marketRate)}
              activePreset={activePreset}
              onPresetSelect={preset => {
                if (marketRate) {
                  const applied = setPriceFromRate({
                    nextRate: getPresetPrice({
                      marketPrice: marketRate,
                      preset,
                    }),
                    forUnit: unit,
                  })

                  // Remembered rather than re-derived from the live market: the
                  // market moves between the click and the next render, so
                  // comparing the stored rate against a freshly computed preset
                  // price deselected the pill on the next tick. Only remembered
                  // when the price landed in the field — a highlighted pill
                  // over an empty input would claim a choice that wasn't made.
                  if (applied) {
                    setActivePreset(preset)
                  }
                }
              }}
              expiryHours={expiryHours}
              onExpiryChange={setExpiryHours}
            />
            {orderNotice ? (
              <LimitSwapNotice
                kind="blocker"
                message={
                  orderNotice === 'memoInvalid' && orderExpressionError
                    ? orderExpressionError
                    : blockerMessage[orderNotice]
                }
              />
            ) : !blocker && priceWarning ? (
              // Guarded on the blocker rather than on the notice: a blocker
              // withheld only because its gate is still resolving must not let
              // a price advisory take the row, or the form would comment on a
              // price for an order it is about to refuse.
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
