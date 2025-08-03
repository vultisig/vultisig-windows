import { createHash } from 'crypto'

import { Vault } from '../../Vault'

export const getVaultExportUid = ({ name, publicKeys, hexChainCode }: Vault) =>
  createHash('sha256')
    .update([name, publicKeys.ecdsa, publicKeys.eddsa, hexChainCode].join('-'))
    .digest('hex')
