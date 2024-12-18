import { EntityWithDecimals } from '../../../coin/Coin';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { EntityWithId } from '../../../lib/utils/entities/EntityWithId';
import { EntityWithTicker } from '../../../lib/utils/entities/EntityWithTicker';
import { asyncFallbackChain } from '../../../lib/utils/promise/asyncFallbackChain';
import { pick } from '../../../lib/utils/record/pick';
import { TransferDirection } from '../../../lib/utils/TransferDirection';
import { ChainAccount } from '../../ChainAccount';
import { toChainAmount } from '../../utils/toChainAmount';
import { getNativeSwapQuote } from '../native/api/getNativeSwapQuote';
import { toNativeSwapAsset } from '../native/asset/toNativeSwapAsset';
import {
  nativeSwapChains,
  nativeSwapEnabledChainsRecord,
} from '../native/NativeSwapChain';
import { getOneInchSwapQuote } from '../oneInch/api/getOneInchSwapQuote';
import { oneInchSwapEnabledChains } from '../oneInch/OneInchSwapEnabledChains';
import { SwapQuote } from './SwapQuote';

type FindSwapQuoteInput = Record<
  TransferDirection,
  ChainAccount & EntityWithId & EntityWithTicker & EntityWithDecimals
> & {
  amount: number;

  isAffiliate: boolean;
};

export const findSwapQuote = ({
  from,
  to,
  amount,
  isAffiliate,
}: FindSwapQuoteInput): Promise<SwapQuote> => {
  const involvedChains = [from.chain, to.chain];

  const matchingSwapChains = nativeSwapChains.filter(swapChain =>
    involvedChains.every(chain =>
      isOneOf(chain, nativeSwapEnabledChainsRecord[swapChain])
    )
  );

  const fetchers = matchingSwapChains.map(
    swapChain => async (): Promise<SwapQuote> => {
      const [fromAsset, toAsset] = [from, to].map(asset =>
        toNativeSwapAsset(pick(asset, ['id', 'chain', 'ticker']))
      );

      const native = await getNativeSwapQuote({
        swapChain,
        destination: to.address,
        fromAsset,
        toAsset,
        amount,
        isAffiliate,
      });

      return { native };
    }
  );

  if (
    isOneOf(from.chain, oneInchSwapEnabledChains) &&
    from.chain === to.chain
  ) {
    fetchers.push(async (): Promise<SwapQuote> => {
      const oneInch = await getOneInchSwapQuote({
        account: pick(from, ['address', 'chain']),
        fromCoinId: from.id,
        toCoinId: to.id,
        amount: toChainAmount(amount, from.decimals),
        isAffiliate,
      });

      return { oneInch };
    });
  }

  return asyncFallbackChain(...fetchers);
};
