import { useMemo } from 'react';

import { storage } from '../../../../wailsjs/go/models';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { useVaults } from '../../queries/useVaultsQuery';
import { useCurrentJoinKeygenMsg } from '../state/currentJoinKeygenMsg';
import { CurrentKeygenVaultProvider } from '../state/currentKeygenVault';
import { useCurrentLocalPartyId } from '../state/currentLocalPartyId';

export const JoinKeygenVaultProvider: React.FC<ComponentWithChildrenProps> = ({
  children,
}) => {
  const keygenMsg = useCurrentJoinKeygenMsg();

  const vaults = useVaults();

  const { vaultName, hexChainCode } = keygenMsg;

  const localPartyId = useCurrentLocalPartyId();

  const value = useMemo(() => {
    if ('publicKeyEcdsa' in keygenMsg) {
      const existingVault = vaults.find(
        vault => vault.public_key_ecdsa === keygenMsg.publicKeyEcdsa
      );
      if (existingVault) {
        return existingVault;
      }
    }

    const vault = new storage.Vault();
    vault.name = vaultName;
    vault.hex_chain_code = hexChainCode;
    vault.local_party_id = localPartyId;

    if ('oldResharePrefix' in keygenMsg) {
      vault.reshare_prefix = keygenMsg.oldResharePrefix;
    }

    if ('oldParties' in keygenMsg) {
      vault.signers = keygenMsg.oldParties;
    }

    return vault;
  }, [hexChainCode, keygenMsg, localPartyId, vaultName, vaults]);

  return (
    <CurrentKeygenVaultProvider value={value}>
      {children}
    </CurrentKeygenVaultProvider>
  );
};
