import { useQuery } from '@tanstack/react-query';
import { TokensStore } from '../../services/Coin/CoinList';
import { useCurrentVaultId } from '../state/useCurrentVaultId';
import { useAssertWalletCore } from '../../main';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { Chain } from '../../model/chain';
import { useAssertCurrentVault } from '../state/useCurrentVault';

export const useVaultAddressQuery = (chain: Chain) => {
  const vaultId = useCurrentVaultId();
  const vault = useAssertCurrentVault();

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
        vault.public_key_ecdsa || '',
        vault.public_key_eddsa || '',
        vault.hex_chain_code || ''
      );

      return coin.address;
    },
  });
};
