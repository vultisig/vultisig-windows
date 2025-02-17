import { fromChainAmount } from '@core/chain/amount/fromChainAmount';
import { toChainAmount } from '@core/chain/amount/toChainAmount';
import { AccountCoin } from '@core/chain/coin/AccountCoin';
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin';
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin';
import { formatAmount } from '@lib/utils/formatAmount';
import { addQueryParams } from '@lib/utils/query/addQueryParams';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { TransferDirection } from '@lib/utils/TransferDirection';

import { toNativeSwapAsset } from '../asset/toNativeSwapAsset';
import { nativeSwapDecimals } from '../config';
import { nativeSwapAffiliateConfig } from '../nativeSwapAffiliateConfig';
import {
  nativeSwapApiBaseUrl,
  NativeSwapChain,
  nativeSwapStreamingInterval,
} from '../NativeSwapChain';
import { NativeSwapQuote } from '../NativeSwapQuote';

export type GetNativeSwapQuoteInput = Record<TransferDirection, AccountCoin> & {
  swapChain: NativeSwapChain;
  destination: string;
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
  from,
  to,
  amount,
  isAffiliate,
}: GetNativeSwapQuoteInput): Promise<NativeSwapQuote> => {
  const [fromAsset, toAsset] = [from, to].map(asset =>
    toNativeSwapAsset(asset)
  );

  const isDeposit = isFeeCoin(from) && from.chain === swapChain;

  const fromDecimals = isDeposit
    ? chainFeeCoin[swapChain].decimals
    : nativeSwapDecimals;

  const chainAmount = toChainAmount(amount, fromDecimals);

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
      nativeSwapDecimals
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
