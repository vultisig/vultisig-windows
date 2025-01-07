import { useQuery } from '@tanstack/react-query';

import { createCoin } from '../../coin/utils/createCoin';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { TokensStore } from '../../services/Coin/CoinList';
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

      const publicKey = await getVaultPublicKey({
        vault,
        chain: nativeTokens.chain,
        walletCore,
      });

      const coin = createCoin({
        coinMeta: nativeTokens,
        publicKey,
        walletCore,
      });

      return coin.address;
    },
  });
};
