import { addQueryParams } from '../../../../lib/utils/query/addQueryParams';
import { queryUrl } from '../../../../lib/utils/query/queryUrl';
import { thorchainSwapConfig } from '../config';
import { ThorchainSwapQuote } from './ThorchainSwapQuote';

type Input = {
  destination: string;
  fromAsset: string;
  toAsset: string;
  amount: string;
  isAffiliate: boolean;
};

const swapBaseUrl = `${thorchainSwapConfig.apiUrl}/quote/swap`;

type ThorchainSwapQuoteErrorResponse = {
  error: string;
};

export const getThorchainSwapQuote = async ({
  destination,
  fromAsset,
  toAsset,
  amount,
  isAffiliate,
}: Input) => {
  const params = {
    from_asset: fromAsset,
    to_asset: toAsset,
    amount,
    destination,
    streaming_interval: thorchainSwapConfig.streamingInterval,
    ...(isAffiliate
      ? {
          affiliate: thorchainSwapConfig.affiliateFeeAddress,
          affiliate_bps: thorchainSwapConfig.affiliateFeeRateBps,
        }
      : {}),
  };

  const url = addQueryParams(swapBaseUrl, params);

  const result = await queryUrl<
    ThorchainSwapQuote | ThorchainSwapQuoteErrorResponse
  >(url);

  if ('error' in result) {
    throw new Error(result.error);
  }

  return result;
};
