import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker';
import { match } from '@lib/utils/match';
import { TransferDirection } from '@lib/utils/TransferDirection';
import { TW } from '@trustwallet/wallet-core';

import { CoinKey } from '../../../../../coin/Coin';
import { isNativeCoin } from '../../../../utils/isNativeCoin';
import {
  ThorchainSwapEnabledChain,
  thorchainSwapProtoChains,
} from '../thorchainSwapProtoChains';

type Input = CoinKey &
  EntityWithTicker & {
    direction: TransferDirection;
  };

export const toThorchainSwapAssetProto = ({
  ticker,
  chain,
  id,
  direction,
}: Input) =>
  TW.THORChainSwap.Proto.Asset.create({
    chain: thorchainSwapProtoChains[chain as ThorchainSwapEnabledChain],
    symbol: ticker,
    ...(isNativeCoin({ chain, id })
      ? {}
      : {
          tokenId: match(direction, {
            from: () => id,
            to: () => `${ticker}-${id.slice(-6).toUpperCase()}`,
          }),
        }),
  });
