import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isInError } from '@lib/utils/error/isInError'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { toNativeSwapAsset } from '../asset/toNativeSwapAsset'
import { nativeSwapAffiliateConfig } from '../nativeSwapAffiliateConfig'
import {
  nativeSwapApiBaseUrl,
  NativeSwapChain,
  nativeSwapStreamingInterval,
} from '../NativeSwapChain'
import { NativeSwapQuote } from '../NativeSwapQuote'
import { getNativeSwapDecimals } from '../utils/getNativeSwapDecimals'

type GetNativeSwapQuoteInput = Record<TransferDirection, AccountCoin> & {
  swapChain: NativeSwapChain
  destination: string
  amount: number
  isAffiliate: boolean
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
  isAffiliate,
}: GetNativeSwapQuoteInput): Promise<NativeSwapQuote> => {
  const [fromAsset, toAsset] = [from, to].map(asset => toNativeSwapAsset(asset))

  const fromDecimals = getNativeSwapDecimals(from)

  const chainAmount = toChainAmount(amount, fromDecimals)

  const swapBaseUrl = `${nativeSwapApiBaseUrl[swapChain]}/quote/swap`
  const params = {
    from_asset: fromAsset,
    to_asset: toAsset,
    amount: chainAmount.toString(),
    destination,
    streaming_interval: nativeSwapStreamingInterval[swapChain],
    ...(isAffiliate
      ? {
          affiliate: nativeSwapAffiliateConfig.affiliateFeeAddress,
          affiliate_bps: nativeSwapAffiliateConfig.affiliateFeeRateBps,
        }
      : {}),
  }

  const url = addQueryParams(swapBaseUrl, params)

  const result = await queryUrl<
    NativeSwapQuoteResponse | NativeSwapQuoteErrorResponse
  >(url)

  if ('error' in result) {
    if (isInError(result.error, 'not enough asset to pay for fees')) {
      throw new Error('Not enough funds to cover gas')
    }
    throw new Error(result.error)
  }

  if (BigInt(result.recommended_min_amount_in) > chainAmount) {
    const minAmount = fromChainAmount(
      result.recommended_min_amount_in,
      fromDecimals
    )

    const formattedMinAmount = formatTokenAmount(minAmount)

    const msg = `Swap amount too small. Recommended amount ${formattedMinAmount}`

    throw new Error(msg)
  }

  return {
    ...result,
    swapChain,
  }
}
