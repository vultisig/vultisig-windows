import { useMutation } from '@tanstack/react-query';

import { useInvalidateQueries } from '../../../../lib/ui/query/hooks/useInvalidateQueries';
import { match } from '../../../../lib/utils/match';
import { useAppPathParams } from '../../../../navigation/hooks/useAppPathParams';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../../../services/Vault/VaultServiceFactory';
import { vaultsQueryKey } from '../../../queries/useVaultsQuery';
import { useCurrentVaultId } from '../../../state/useCurrentVaultId';
import { getStorageVaultId } from '../../../utils/storageVault';
import { useKeygenTargetVault } from '../../hooks/useKeygenTargetVault';
import { KeygenType } from '../../KeygenType';
import { useCurrentJoinKeygenMsg } from '../../state/currentJoinKeygenMsg';
import { useCurrentServerUrl } from '../../state/currentServerUrl';

export const useJoinKeygenMutation = () => {
  const walletCore = useAssertWalletCore();

  const keygenMsg = useCurrentJoinKeygenMsg();

  const [{ keygenType }] = useAppPathParams<'joinKeygen'>();

  const [serverUrl] = useCurrentServerUrl();

  const { sessionId, encryptionKeyHex } = keygenMsg;

  const vault = useKeygenTargetVault();

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
