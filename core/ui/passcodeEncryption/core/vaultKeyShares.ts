import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { recordMap } from '@lib/utils/record/recordMap'

import { VaultKeyShares } from '../../vault/Vault'
import { passcodeEncryptionConfig } from './config'

type Input = {
  keyShares: VaultKeyShares
  key: string
}

export const encryptVaultKeyShares = ({ keyShares, key }: Input) =>
  recordMap(keyShares, value =>
    encryptWithAesGcm({
      key,
      value: Buffer.from(value, passcodeEncryptionConfig.plainTextEncoding),
    }).toString(passcodeEncryptionConfig.encryptedEncoding)
  )

export const decryptVaultKeyShares = ({ keyShares, key }: Input) =>
  recordMap(keyShares, value =>
    decryptWithAesGcm({
      key,
      value: Buffer.from(value, passcodeEncryptionConfig.encryptedEncoding),
    }).toString(passcodeEncryptionConfig.plainTextEncoding)
  )
