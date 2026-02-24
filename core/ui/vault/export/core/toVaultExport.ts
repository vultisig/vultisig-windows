import { hasServer } from '@core/mpc/devices/localPartyId'
import { isKeyImportVault, Vault } from '@core/mpc/vault/Vault'

import { VaultExport } from '.'
import { getVaultExportUid } from './uid'

export const toVaultExport = (vault: Vault): VaultExport => ({
  uid: getVaultExportUid(vault),
  name: vault.name,
  publicKeyEcdsa: vault.publicKeys.ecdsa,
  publicKeyEddsa: vault.publicKeys.eddsa,
  hexChainCode: vault.hexChainCode,
  isFastVault: hasServer(vault.signers),
  isKeyImportVault: isKeyImportVault(vault),
  localPartyId: vault.localPartyId,
  parties: vault.signers,
})
