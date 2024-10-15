import { useMutation } from '@tanstack/react-query';

import { useInvalidateQueries } from '../../../../lib/ui/query/hooks/useInvalidateQueries';
import { match } from '../../../../lib/utils/match';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../../../services/Vault/VaultServiceFactory';
import { vaultsQueryKey } from '../../../queries/useVaultsQuery';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useCurrentVaultId } from '../../../state/useCurrentVaultId';
import { getStorageVaultId } from '../../../utils/storageVault';
import { KeygenType } from '../../KeygenType';
import { useCurrentKeygenType } from '../../state/currentKeygenType';
import { useCurrentKeygenVault } from '../../state/currentKeygenVault';
import { useCurrentServerUrl } from '../../state/currentServerUrl';
import { useCurrentSessionId } from '../state/currentSessionId';

export const useKeygenMutation = () => {
  const walletCore = useAssertWalletCore();

  const keygenType = useCurrentKeygenType();

  const serverUrl = useCurrentServerUrl();

  const encryptionKeyHex = useCurrentHexEncryptionKey();

  const sessionId = useCurrentSessionId();

  const vault = useCurrentKeygenVault();

  const invalidateQueries = useInvalidateQueries();

  const [, setCurrentVaultId] = useCurrentVaultId();

  return useMutation({
    mutationFn: async () => {
      const vaultService = VaultServiceFactory.getService(walletCore);

      const newVault = await match(keygenType, {
        [KeygenType.Keygen]: async () => {
          return vaultService.startKeygen(
            vault,
            sessionId,
            encryptionKeyHex,
            serverUrl
          );
        },
        [KeygenType.Reshare]: async () => {
          return vaultService.reshare(
            vault,
            sessionId,
            encryptionKeyHex,
            serverUrl
          );
        },
      });

      await invalidateQueries(vaultsQueryKey);

      setCurrentVaultId(getStorageVaultId(newVault));

      return newVault;
    },
  });
};
