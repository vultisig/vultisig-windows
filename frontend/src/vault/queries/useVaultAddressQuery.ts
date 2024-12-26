import { useQuery } from '@tanstack/react-query';

import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { TokensStore } from '../../services/Coin/CoinList';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { getVaultPublicKey } from '../publicKey/getVaultPublicKey';
import { useCurrentVault } from '../state/currentVault';
import { useCurrentVaultId } from '../state/currentVaultId';

export const useVaultAddressQuery = (chain: Chain) => {
  const vaultId = useCurrentVaultId();
  const vault = useCurrentVault();

  const walletCore = useAssertWalletCore();

  return useQuery({
    queryKey: ['vaultChainAddress', vaultId, chain],
    queryFn: async () => {
      const [nativeTokens] = TokensStore.TokenSelectionAssets.filter(
        token => token.isNativeToken && token.chain === chain
      );

      if (!nativeTokens) {
        throw new Error(`No native token found for chain: ${chain}`);
      }

      const coinService = CoinServiceFactory.createCoinService(
        chain,
        walletCore!
      );

      const coin = await coinService.createCoin(
        nativeTokens,
        getVaultPublicKey({
          vault,
          chain: nativeTokens.chain,
        })
      );

      return coin.address;
    },
  });
};
