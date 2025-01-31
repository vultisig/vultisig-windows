import { useMemo } from 'react';

import { storage } from '../../../wailsjs/go/models';
import { ChildrenProp } from '../../lib/ui/props';
import { CurrentKeygenVaultProvider } from '../keygen/state/currentKeygenVault';
import { useCurrentLocalPartyId } from '../keygen/state/currentLocalPartyId';
import { useVaultKeygenDevices } from './hooks/useVaultKegenDevices';
import { useCurrentHexChainCode } from './state/currentHexChainCode';
import { useVaultName } from './state/vaultName';

export const StartKeygenVaultProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const localPartyId = useCurrentLocalPartyId();
  const [vaultName] = useVaultName();
  const devices = useVaultKeygenDevices();
  const hexChainCode = useCurrentHexChainCode();

  const value = useMemo(() => {
    const result = new storage.Vault();
    result.local_party_id = localPartyId;
    result.name = vaultName;
    result.signers = devices;
    result.hex_chain_code = hexChainCode;

    return result;
  }, [devices, hexChainCode, localPartyId, vaultName]);

  return (
    <CurrentKeygenVaultProvider value={value}>
      {children}
    </CurrentKeygenVaultProvider>
  );
};
