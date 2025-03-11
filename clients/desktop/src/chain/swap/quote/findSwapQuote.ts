import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { asyncFallbackChain } from '@lib/utils/promise/asyncFallbackChain'
import { pick } from '@lib/utils/record/pick'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { getLifiSwapQuote } from '../general/lifi/api/getLifiSwapQuote'
import { lifiSwapEnabledChains } from '../general/lifi/LifiSwapEnabledChains'
import { getOneInchSwapQuote } from '../general/oneInch/api/getOneInchSwapQuote'
import { oneInchSwapEnabledChains } from '../general/oneInch/OneInchSwapEnabledChains'
import { getNativeSwapQuote } from '../native/api/getNativeSwapQuote'
import {
  nativeSwapChains,
  nativeSwapEnabledChainsRecord,
} from '../native/NativeSwapChain'
import { NoSwapRoutesError } from '../NoSwapRoutesError'
import { SwapQuote } from './SwapQuote'

type FindSwapQuoteInput = Record<TransferDirection, AccountCoin> & {
  amount: number

  isAffiliate: boolean
}

export const findSwapQuote = ({
  from,
  to,
  amount,
  isAffiliate,
}: FindSwapQuoteInput): Promise<SwapQuote> => {
  const involvedChains = [from.chain, to.chain]

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
        isAffiliate,
      })

      return { native }
    }
  )

  if (
    isOneOf(from.chain, oneInchSwapEnabledChains) &&
    from.chain === to.chain
  ) {
    fetchers.push(async (): Promise<SwapQuote> => {
      const general = await getOneInchSwapQuote({
        account: pick(from, ['address', 'chain']),
        fromCoinId: from.id,
        toCoinId: to.id,
        amount: toChainAmount(amount, from.decimals),
        isAffiliate,
      })

      return { general }
    })
  }

  const fromLifiChain = isOneOf(from.chain, lifiSwapEnabledChains)
  const toLifiChain = isOneOf(to.chain, lifiSwapEnabledChains)

  if (fromLifiChain && toLifiChain) {
    fetchers.push(async (): Promise<SwapQuote> => {
      const general = await getLifiSwapQuote({
        from: {
          ...from,
          chain: fromLifiChain,
        },
        to: {
          ...to,
          chain: toLifiChain,
        },
        amount: toChainAmount(amount, from.decimals),
        address: from.address,
      })

      return { general }
    })
  }

  if (isEmpty(fetchers)) {
    throw new NoSwapRoutesError()
  }

  return asyncFallbackChain(...fetchers)
}
