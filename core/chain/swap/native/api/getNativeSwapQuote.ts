import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isInError } from '@lib/utils/error/isInError'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { toNativeSwapAsset } from '../asset/toNativeSwapAsset'
import { nativeSwapAffiliateConfig } from '../nativeSwapAffiliateConfig'
import {
  nativeSwapApiBaseUrl,
  NativeSwapChain,
  nativeSwapStreamingInterval,
} from '../NativeSwapChain'
import { AffiliateParam, NativeSwapQuote } from '../NativeSwapQuote'
import { getNativeSwapDecimals } from '../utils/getNativeSwapDecimals'

type GetNativeSwapQuoteInput = Record<TransferDirection, AccountCoin> & {
  swapChain: NativeSwapChain
  destination: string
  amount: number
  affiliates: AffiliateParam[]
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
  affiliates,
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
  })

  // THORChain supports nested affiliates; Maya supports single affiliate only
  if (swapChain === 'THORChain') {
    for (const a of affiliates) {
      params.append('affiliate', a.name)
      params.append('affiliate_bps', String(a.bps))
    }
  } else {
    const app = affiliates.find(
      a => a.name === nativeSwapAffiliateConfig.affiliateFeeAddress
    )
    if (app) {
      params.append('affiliate', app.name)
      params.append('affiliate_bps', String(app.bps))
    } else if (affiliates.length) {
      params.append('affiliate', affiliates[0].name)
      params.append('affiliate_bps', String(affiliates[0].bps))
    }
  }

  const url = `${swapBaseUrl}?${params.toString()}`

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
