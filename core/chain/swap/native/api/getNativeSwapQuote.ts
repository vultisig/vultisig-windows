import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TransferDirection } from '@lib/utils/TransferDirection'
import { t } from 'i18next'

import { chainFeeCoin } from '../../../coin/chainFeeCoin'
import { toNativeSwapAsset } from '../asset/toNativeSwapAsset'
import {
  nativeSwapApiBaseUrl,
  NativeSwapChain,
  nativeSwapStreamingInterval,
} from '../NativeSwapChain'
import { NativeSwapQuote } from '../NativeSwapQuote'
import { getNativeSwapDecimals } from '../utils/getNativeSwapDecimals'
import { buildAffiliateParams } from './affiliate'

type GetNativeSwapQuoteInput = Record<TransferDirection, AccountCoin> & {
  swapChain: NativeSwapChain
  destination: string
  amount: number
  referral?: string
  affiliateBps?: number
}

type NativeSwapQuoteErrorResponse = {
  error: string
}

type NativeSwapQuoteResponse = Omit<NativeSwapQuote, 'swapChain'>

export const getNativeSwapQuote = async ({
  swapChain,
  destination,
  from,
  to,
  amount,
  affiliateBps,
  referral,
}: GetNativeSwapQuoteInput): Promise<NativeSwapQuote> => {
  const [fromAsset, toAsset] = [from, to].map(asset => toNativeSwapAsset(asset))

  const fromDecimals = getNativeSwapDecimals(from)

  const chainAmount = toChainAmount(amount, fromDecimals)

  const swapBaseUrl = `${nativeSwapApiBaseUrl[swapChain]}/quote/swap`

  const params = new URLSearchParams({
    from_asset: fromAsset,
    to_asset: toAsset,
    amount: chainAmount.toString(),
    destination,
    streaming_interval: String(nativeSwapStreamingInterval[swapChain]),
    ...(affiliateBps !== undefined
      ? buildAffiliateParams({
          swapChain,
          referral,
          affiliateBps,
        })
      : {}),
  })

  const url = `${swapBaseUrl}?${params.toString()}`

  const result = await queryUrl<
    NativeSwapQuoteResponse | NativeSwapQuoteErrorResponse
  >(url)

  if ('error' in result) {
    if (isInError(result.error, 'not enough asset to pay for fees')) {
      const { ticker } = chainFeeCoin[from.chain]
      throw new Error(
        t('not_enough_asset_to_cover_gas_fees', { asset: ticker })
      )
    }
    throw new Error(result.error)
  }

  return {
    ...result,
    swapChain,
  }
}
