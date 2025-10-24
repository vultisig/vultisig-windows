import { Vault } from '@core/vault/Vault'
import { createHash } from 'crypto'

export const getVaultExportUid = ({ name, publicKeys, hexChainCode }: Vault) =>
  createHash('sha256')
    .update([name, publicKeys.ecdsa, publicKeys.eddsa, hexChainCode].join('-'))
    .digest('hex')
