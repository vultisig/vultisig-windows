import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { storage } from '../../../../wailsjs/go/models'
import { generateLocalPartyId } from '../../../mpc/localPartyId'
import { MpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useVaults } from '../../queries/useVaultsQuery'
import { CurrentVaultProvider } from '../../state/currentVault'

export const JoinKeygenVaultProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const { keygenMsg } = useAppPathState<'joinKeygen'>()

  const vaults = useVaults()

  const { vaultName, hexChainCode } = keygenMsg

  const existingVault = useMemo(() => {
    if ('publicKeyEcdsa' in keygenMsg) {
      const existingVault = vaults.find(
        vault => vault.public_key_ecdsa === keygenMsg.publicKeyEcdsa
      )
      if (existingVault) {
        return existingVault
      }
    }
  }, [keygenMsg, vaults])

  const value = useMemo(() => {
    if (existingVault) {
      return existingVault
    }

    const vault = new storage.Vault()
    vault.name = vaultName
    vault.hex_chain_code = hexChainCode
    vault.local_party_id = generateLocalPartyId()

    if ('oldResharePrefix' in keygenMsg) {
      vault.reshare_prefix = keygenMsg.oldResharePrefix
    }

    if ('oldParties' in keygenMsg) {
      vault.signers = keygenMsg.oldParties
    }

    return vault
  }, [existingVault, hexChainCode, keygenMsg, vaultName])

  return (
    <CurrentVaultProvider value={value}>
      <MpcLocalPartyIdProvider value={value.local_party_id}>
        {children}
      </MpcLocalPartyIdProvider>
    </CurrentVaultProvider>
  )
}
