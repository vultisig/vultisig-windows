import { formatAmount } from '../../../../lib/utils/formatAmount';
import { addQueryParams } from '../../../../lib/utils/query/addQueryParams';
import { queryUrl } from '../../../../lib/utils/query/queryUrl';
import { getChainFeeCoin } from '../../../tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { toChainAmount } from '../../../utils/toChainAmount';
import { nativeSwapAffiliateConfig } from '../nativeSwapAffiliateConfig';
import {
  nativeSwapApiBaseUrl,
  NativeSwapChain,
  nativeSwapStreamingInterval,
} from '../NativeSwapChain';
import { NativeSwapQuote } from '../NativeSwapQuote';

export type GetNativeSwapQuoteInput = {
  swapChain: NativeSwapChain;
  destination: string;
  fromAsset: string;
  toAsset: string;
  amount: number;
  isAffiliate: boolean;
};

type NativeSwapQuoteErrorResponse = {
  error: string;
};

type NativeSwapQuoteResponse = Omit<NativeSwapQuote, 'swapChain'>;

export const getNativeSwapQuote = async ({
  swapChain,
  destination,
  fromAsset,
  toAsset,
  amount,
  isAffiliate,
}: GetNativeSwapQuoteInput): Promise<NativeSwapQuote> => {
  const { decimals } = getChainFeeCoin(swapChain);
  const chainAmount = toChainAmount(amount, decimals);

  const swapBaseUrl = `${nativeSwapApiBaseUrl[swapChain]}/quote/swap`;
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
  };

  const url = addQueryParams(swapBaseUrl, params);

  const result = await queryUrl<
    NativeSwapQuoteResponse | NativeSwapQuoteErrorResponse
  >(url);

  if ('error' in result) {
    throw new Error(result.error);
  }

  if (BigInt(result.recommended_min_amount_in) > chainAmount) {
    const minAmount = fromChainAmount(
      result.recommended_min_amount_in,
      decimals
    );

    const formattedMinAmount = formatAmount(minAmount);

    const msg = `Swap amount too small. Recommended amount ${formattedMinAmount}`;

    throw new Error(msg);
  }

  return {
    ...result,
    swapChain,
  };
};
