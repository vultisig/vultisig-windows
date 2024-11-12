import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../wailsjs/go/models';
import { GetSettings, SaveVault } from '../../../wailsjs/go/storage/Store';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { getLastItemOrder } from '../../lib/utils/order/getLastItemOrder';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { DefaultCoinsService } from '../../services/Coin/DefaultCoinsService';
import { useVaults, vaultsQueryKey } from '../queries/useVaultsQuery';
import { useCurrentVaultId } from '../state/currentVaultId';
import { getStorageVaultId } from '../utils/storageVault';

export const useSaveVaultMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  const walletCore = useAssertWalletCore();

  const vaults = useVaults();

  const [, setCurrentVaultId] = useCurrentVaultId();

  return useMutation({
    mutationFn: async (vault: storage.Vault) => {
      const order = getLastItemOrder(vaults.map(vault => vault.order));

      const newVault = {
        ...vault,
        order,
      } as storage.Vault;

      await SaveVault(newVault);

      await invalidateQueries(vaultsQueryKey);

      setCurrentVaultId(getStorageVaultId(newVault));

      const settings = await GetSettings();
      const defaultChains = settings[0]?.default_chains || {};

      new DefaultCoinsService(walletCore).applyDefaultCoins(
        newVault,
        defaultChains
      );
    },
  });
};
