import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isInError } from '@lib/utils/error/isInError'
import { formatAmount } from '@lib/utils/formatAmount'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { Chain } from '../../../Chain'
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
  })

  if (affiliateBps) {
    params.append('affiliate', nativeSwapAffiliateConfig.affiliateFeeAddress)
    params.append('affiliate_bps', affiliateBps.toString())
  }

  // THORChain supports nested affiliates; Maya supports single affiliate only
  if (referral && !(swapChain === Chain.MayaChain && affiliateBps)) {
    params.append('affiliate', referral)
    params.append(
      'affiliate_bps',
      nativeSwapAffiliateConfig.referralDiscountAffiliateFeeRateBps.toString()
    )
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

    const formattedMinAmount = formatAmount(minAmount, from)

    const msg = `Swap amount too small. Recommended amount ${formattedMinAmount}`

    throw new Error(msg)
  }

  return {
    ...result,
    swapChain,
  }
}
