import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { storage } from '../../../wailsjs/go/models'
import { useMpcLocalPartyId } from '../../mpc/localPartyId/state/mpcLocalPartyId'
import { useMpcSigners } from '../../mpc/signers/state/mpcSigners'
import { CurrentVaultProvider } from '../state/currentVault'
import { useCurrentHexChainCode } from './state/currentHexChainCode'
import { useVaultName } from './state/vaultName'

export const StartKeygenVaultProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const localPartyId = useMpcLocalPartyId()
  const [vaultName] = useVaultName()
  const devices = useMpcSigners()
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
