import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { recordMap } from '@lib/utils/record/recordMap'

import { VaultKeyShares } from '../../vault/Vault'
import { decryptedPasscodeEncoding, encryptedPasscodeEncoding } from './config'

type Input = {
  keyShares: VaultKeyShares
  key: string
}

export const encryptVaultKeyShares = ({ keyShares, key }: Input) =>
  recordMap(keyShares, value =>
    encryptWithAesGcm({
      key,
      value: Buffer.from(value, decryptedPasscodeEncoding),
    }).toString(encryptedPasscodeEncoding)
  )

export const decryptVaultKeyShares = ({ keyShares, key }: Input) =>
  recordMap(keyShares, value =>
    decryptWithAesGcm({
      key,
      value: Buffer.from(value, encryptedPasscodeEncoding),
    }).toString(decryptedPasscodeEncoding)
  )
