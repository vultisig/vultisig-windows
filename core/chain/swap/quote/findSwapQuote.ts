import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getLifiSwapQuote } from '@core/chain/swap/general/lifi/api/getLifiSwapQuote'
import { lifiSwapEnabledChains } from '@core/chain/swap/general/lifi/LifiSwapEnabledChains'
import { getOneInchSwapQuote } from '@core/chain/swap/general/oneInch/api/getOneInchSwapQuote'
import { oneInchSwapEnabledChains } from '@core/chain/swap/general/oneInch/OneInchSwapEnabledChains'
import { NoSwapRoutesError } from '@core/chain/swap/NoSwapRoutesError'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { attempt } from '@lib/utils/attempt'
import { bigIntToNumber } from '@lib/utils/bigint/bigIntToNumber'
import { isInError } from '@lib/utils/error/isInError'
import { asyncFallbackChain } from '@lib/utils/promise/asyncFallbackChain'
import { pick } from '@lib/utils/record/pick'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { Chain } from '../../Chain'
import { isChainOfKind } from '../../ChainKind'
import { getSwapAffiliateBps, VultDiscountTier } from '../affiliate'
import { SwapDiscount } from '../discount/SwapDiscount'
import { getKyberSwapQuote } from '../general/kyber/api/quote'
import { kyberSwapEnabledChains } from '../general/kyber/chains'
import { getNativeSwapQuote } from '../native/api/getNativeSwapQuote'
import {
  nativeSwapChains,
  nativeSwapEnabledChainsRecord,
} from '../native/NativeSwapChain'
import { SwapQuote } from './SwapQuote'

export type FindSwapQuoteInput = Record<TransferDirection, AccountCoin> & {
  amount: bigint
  referral?: string
  vultDiscountTier?: VultDiscountTier | null
}

type SwapQuoteFetcher = () => Promise<SwapQuote>

export const findSwapQuote = async ({
  from,
  to,
  amount,
  referral,
  vultDiscountTier,
}: FindSwapQuoteInput): Promise<SwapQuote> => {
  const affiliateBps = getSwapAffiliateBps(vultDiscountTier ?? null)

  const vultDiscount: SwapDiscount[] = vultDiscountTier
    ? [{ vult: { tier: vultDiscountTier } }]
    : []

  const referralDiscount: SwapDiscount[] = referral ? [{ referral: {} }] : []

  const involvedChains = [from.chain, to.chain]

  const matchingSwapChains = nativeSwapChains.filter(swapChain =>
    involvedChains.every(chain =>
      isOneOf(chain, nativeSwapEnabledChainsRecord[swapChain])
    )
  )

  const getNativeFetchers = (): SwapQuoteFetcher[] =>
    matchingSwapChains.map(swapChain => async (): Promise<SwapQuote> => {
      const fromDecimals = from.decimals
      const amountNumber = bigIntToNumber(amount, fromDecimals)
      const native = await getNativeSwapQuote({
        swapChain,
        destination: to.address,
        from,
        to,
        amount: amountNumber,
        referral,
        affiliateBps,
      })

      return {
        quote: { native },
        discounts:
          swapChain === Chain.THORChain
            ? [...vultDiscount, ...referralDiscount]
            : vultDiscount,
      }
    })

  const getGeneralFetchers = (): SwapQuoteFetcher[] => {
    const result: SwapQuoteFetcher[] = []

    const fromChain = from.chain
    const toChain = to.chain
    const chainAmount = amount

    if (
      isOneOf(fromChain, kyberSwapEnabledChains) &&
      isOneOf(toChain, kyberSwapEnabledChains) &&
      fromChain === toChain
    ) {
      result.push(async (): Promise<SwapQuote> => {
        const general = await getKyberSwapQuote({
          from: {
            ...from,
            chain: fromChain,
          },
          to: {
            ...to,
            chain: toChain,
          },
          amount: chainAmount,
          isAffiliate: !!affiliateBps,
        })

        return { quote: { general }, discounts: [] }
      })
    }

    if (
      isOneOf(from.chain, oneInchSwapEnabledChains) &&
      from.chain === to.chain
    ) {
      result.push(async (): Promise<SwapQuote> => {
        const general = await getOneInchSwapQuote({
          account: pick(from, ['address', 'chain']),
          fromCoinId: from.id ?? from.ticker,
          toCoinId: to.id ?? to.ticker,
          amount: chainAmount,
          affiliateBps,
        })

        return { quote: { general }, discounts: vultDiscount }
      })
    }

    if (
      isOneOf(fromChain, lifiSwapEnabledChains) &&
      isOneOf(toChain, lifiSwapEnabledChains)
    ) {
      result.push(async (): Promise<SwapQuote> => {
        const general = await getLifiSwapQuote({
          from: {
            ...from,
            chain: fromChain,
          },
          to: {
            ...to,
            chain: toChain,
          },
          amount: chainAmount,
          affiliateBps,
        })

        return { quote: { general }, discounts: vultDiscount }
      })
    }

    return result
  }

  const shouldPreferGeneralSwap =
    [from.chain, to.chain].every(chain => isChainOfKind(chain, 'evm')) &&
    [from.id, to.id].some(v => v)

  const fetchers = shouldPreferGeneralSwap
    ? [...getGeneralFetchers(), ...getNativeFetchers()]
    : [...getNativeFetchers(), ...getGeneralFetchers()]

  if (isEmpty(fetchers)) {
    throw new NoSwapRoutesError()
  }

  const { data, error } = await attempt(asyncFallbackChain(...fetchers))

  if (data) {
    return data
  }

  if (isInError(error, 'dust threshold')) {
    throw new Error(
      'Swap amount too small. Please increase the amount to proceed.'
    )
  }

  throw error
}
