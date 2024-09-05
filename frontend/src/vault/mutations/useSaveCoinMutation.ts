import { useMutation } from '@tanstack/react-query';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { CoinMeta } from '../../model/coin-meta';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { useAssertWalletCore } from '../../main';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';

export const useSaveCoinMutation = () => {
  const vault = useAssertCurrentVault();

  const walletCore = useAssertWalletCore();

  const invalidate = useInvalidateQueries();

  return useMutation({
    mutationFn: async (coinMeta: CoinMeta) => {
      const coinService = CoinServiceFactory.createCoinService(
        coinMeta.chain,
        walletCore
      );

      const coin = await coinService.createCoin(
        coinMeta,
        vault.public_key_ecdsa || '',
        vault.public_key_eddsa || '',
        vault.hex_chain_code || ''
      );

      await coinService.saveCoin(coin, new Vault(vault));

      await invalidate(vaultsQueryKey);
    },
  });
};
