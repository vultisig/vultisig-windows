import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../../../wailsjs/go/models';
import { useInvalidateQueries } from '../../../../lib/ui/query/hooks/useInvalidateQueries';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../../../services/Vault/VaultServiceFactory';
import { vaultsQueryKey } from '../../../queries/useVaultsQuery';
import { useVaultKeygenDevices } from '../../../setup/hooks/useVaultKegenDevices';
import { useCurrentHexChainCode } from '../../../setup/state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useVaultName } from '../../../setup/state/vaultName';
import { useCurrentVaultId } from '../../../state/useCurrentVaultId';
import { getStorageVaultId } from '../../../utils/storageVault';
import { useCurrentSessionId } from '../../shared/state/currentSessionId';
import { useCurrentLocalPartyId } from '../../state/currentLocalPartyId';
import { useCurrentServerUrl } from '../../state/currentServerUrl';

export const useStartKeygenMutation = () => {
  const walletCore = useAssertWalletCore();

  const sessionId = useCurrentSessionId();
  const encryptionKeyHex = useCurrentHexEncryptionKey();

  const serverUrl = useCurrentServerUrl();

  const invalidateQueries = useInvalidateQueries();

  const [, setCurrentVaultId] = useCurrentVaultId();

  const localPartyId = useCurrentLocalPartyId();
  const [vaultName] = useVaultName();
  const devices = useVaultKeygenDevices();
  const hexChainCode = useCurrentHexChainCode();

  return useMutation({
    mutationFn: async () => {
      const vaultService = VaultServiceFactory.getService(walletCore);

      const template = new storage.Vault();
      template.local_party_id = localPartyId;
      template.name = vaultName;
      template.signers = devices;
      template.hex_chain_code = hexChainCode;

      const newVault = await vaultService.startKeygen(
        template,
        sessionId,
        encryptionKeyHex,
        serverUrl
      );

      await invalidateQueries(vaultsQueryKey);

      setCurrentVaultId(getStorageVaultId(newVault));

      return newVault;
    },
  });
};
