import { useQuery } from '@tanstack/react-query';

import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { IRpcService } from '../../services/Rpc/IRpcService';
import { RpcServiceFactory } from '../../services/Rpc/RpcServiceFactory';
import { ITokenService } from '../../services/Tokens/ITokenService';

export const useAutoDiscoverTokensForNativeToken = ({
  chain,
  coin,
}: {
  chain: Chain;
  coin: Coin;
}) => {
  const factory = RpcServiceFactory.createRpcService(chain) as IRpcService &
    ITokenService;

  return useQuery({
    queryKey: ['autoDiscoverTokens', coin.address],
    queryFn: async () => {
      // Some chains don't support auto-discovering tokens
      if (!factory.getTokens) {
        return [];
      }

      if (!coin.isNativeToken) {
        throw new Error('Coin is not native token');
      }

      if (!coin) {
        throw new Error('Coin is undefined');
      }

      const tokens = await factory.getTokens(coin);

      if (!tokens.length) {
        return [];
      }

      return tokens;
    },
  });
};
