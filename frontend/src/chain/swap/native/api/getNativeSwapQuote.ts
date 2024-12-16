import { formatAmount } from '../../../../lib/utils/formatAmount';
import { addQueryParams } from '../../../../lib/utils/query/addQueryParams';
import { queryUrl } from '../../../../lib/utils/query/queryUrl';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { getChainPrimaryCoin } from '../../../utils/getChainPrimaryCoin';
import { nativeSwapAffiliateConfig } from '../nativeSwapAffiliateConfig';
import {
  nativeSwapApiBaseUrl,
  NativeSwapChain,
  nativeSwapStreamingInterval,
} from '../NativeSwapChain';
import { NativeSwapQuote } from './NativeSwapQuote';

type Input = {
  swapChain: NativeSwapChain;
  destination: string;
  fromAsset: string;
  toAsset: string;
  amount: bigint;
  isAffiliate: boolean;
};

type NativeSwapQuoteErrorResponse = {
  error: string;
};

export const getNativeSwapQuote = async ({
  swapChain,
  destination,
  fromAsset,
  toAsset,
  amount,
  isAffiliate,
}: Input) => {
  const swapBaseUrl = `${nativeSwapApiBaseUrl[swapChain]}/quote/swap`;
  const params = {
    from_asset: fromAsset,
    to_asset: toAsset,
    amount: amount.toString(),
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

  const result = await queryUrl<NativeSwapQuote | NativeSwapQuoteErrorResponse>(
    url
  );

  if ('error' in result) {
    throw new Error(result.error);
  }

  if (BigInt(result.recommended_min_amount_in) > amount) {
    const { decimals } = getChainPrimaryCoin(swapChain);

    const minAmount = fromChainAmount(
      result.recommended_min_amount_in,
      decimals
    );

    const formattedMinAmount = formatAmount(minAmount);

    const msg = `Swap amount too small. Recommended amount ${formattedMinAmount}`;

    throw new Error(msg);
  }

  return result;
};
