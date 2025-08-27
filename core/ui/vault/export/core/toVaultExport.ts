import { hasServer } from '@core/mpc/devices/localPartyId'

import { Vault } from '../../Vault'
import { VaultExport } from '.'
import { getVaultExportUid } from './uid'

export const toVaultExport = (vault: Vault): VaultExport => ({
  uid: getVaultExportUid(vault),
  name: vault.name,
  publicKeyEcdsa: vault.publicKeys.ecdsa,
  publicKeyEddsa: vault.publicKeys.eddsa,
  hexChainCode: vault.hexChainCode,
  isFastVault: hasServer(vault.signers),
})
