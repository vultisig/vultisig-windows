import { useMemo } from 'react'

import { storage } from '../../../wailsjs/go/models'
import { ChildrenProp } from '../../lib/ui/props'
import { useCurrentLocalPartyId } from '../keygen/state/currentLocalPartyId'
import { CurrentVaultProvider } from '../state/currentVault'
import { useVaultKeygenDevices } from './hooks/useVaultKegenDevices'
import { useCurrentHexChainCode } from './state/currentHexChainCode'
import { useVaultName } from './state/vaultName'

export const StartKeygenVaultProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const localPartyId = useCurrentLocalPartyId()
  const [vaultName] = useVaultName()
  const devices = useVaultKeygenDevices()
  const hexChainCode = useCurrentHexChainCode()

  const value = useMemo(() => {
    const result = new storage.Vault()
    result.local_party_id = localPartyId
    result.name = vaultName
    result.signers = devices
    result.hex_chain_code = hexChainCode

    return result
  }, [devices, hexChainCode, localPartyId, vaultName])

  return <CurrentVaultProvider value={value}>{children}</CurrentVaultProvider>
}
