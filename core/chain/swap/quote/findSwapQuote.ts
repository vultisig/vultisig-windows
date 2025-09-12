import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getLifiSwapQuote } from '@core/chain/swap/general/lifi/api/getLifiSwapQuote'
import { lifiSwapEnabledChains } from '@core/chain/swap/general/lifi/LifiSwapEnabledChains'
import { getOneInchSwapQuote } from '@core/chain/swap/general/oneInch/api/getOneInchSwapQuote'
import { oneInchSwapEnabledChains } from '@core/chain/swap/general/oneInch/OneInchSwapEnabledChains'
import { NoSwapRoutesError } from '@core/chain/swap/NoSwapRoutesError'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { asyncFallbackChain } from '@lib/utils/promise/asyncFallbackChain'
import { pick } from '@lib/utils/record/pick'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { getKyberSwapQuote } from '../general/kyber/api/quote'
import { kyberSwapEnabledChains } from '../general/kyber/chains'
import { getNativeSwapQuote } from '../native/api/getNativeSwapQuote'
import {
  nativeSwapChains,
  nativeSwapEnabledChainsRecord,
} from '../native/NativeSwapChain'
import { AffiliateParam } from '../native/NativeSwapQuote'
import { SwapQuote } from './SwapQuote'

type FindSwapQuoteInput = Record<TransferDirection, AccountCoin> & {
  amount: number
  affiliates: AffiliateParam[]
}

export const findSwapQuote = ({
  from,
  to,
  amount,
  affiliates,
}: FindSwapQuoteInput): Promise<SwapQuote> => {
  const involvedChains = [from.chain, to.chain]
  const isAffiliate = affiliates.some(a => a.bps > 0)

  const matchingSwapChains = nativeSwapChains.filter(swapChain =>
    involvedChains.every(chain =>
      isOneOf(chain, nativeSwapEnabledChainsRecord[swapChain])
    )
  )

  const fetchers = matchingSwapChains.map(
    swapChain => async (): Promise<SwapQuote> => {
      const native = await getNativeSwapQuote({
        swapChain,
        destination: to.address,
        from,
        to,
        amount,
        affiliates,
      })

      return { native }
    }
  )

  const fromChain = from.chain
  const toChain = to.chain
  const chainAmount = toChainAmount(amount, from.decimals)

  if (
    isOneOf(fromChain, kyberSwapEnabledChains) &&
    isOneOf(toChain, kyberSwapEnabledChains) &&
    fromChain === toChain
  ) {
    fetchers.push(async (): Promise<SwapQuote> => {
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
        isAffiliate,
      })

      return { general }
    })
  }

  if (
    isOneOf(from.chain, oneInchSwapEnabledChains) &&
    from.chain === to.chain
  ) {
    fetchers.push(async (): Promise<SwapQuote> => {
      const general = await getOneInchSwapQuote({
        account: pick(from, ['address', 'chain']),
        fromCoinId: from.id ?? from.ticker,
        toCoinId: to.id ?? to.ticker,
        amount: chainAmount,
        isAffiliate,
      })

      return { general }
    })
  }

  if (
    isOneOf(fromChain, lifiSwapEnabledChains) &&
    isOneOf(toChain, lifiSwapEnabledChains)
  ) {
    fetchers.push(async (): Promise<SwapQuote> => {
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
      })

      return { general }
    })
  }

  if (isEmpty(fetchers)) {
    throw new NoSwapRoutesError()
  }

  return asyncFallbackChain(...fetchers)
}
