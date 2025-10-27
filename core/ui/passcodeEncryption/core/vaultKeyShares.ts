import { VaultKeyShares } from '@core/vault/Vault'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import {
  encryptedEncoding,
  plainTextEncoding,
} from '@lib/utils/encryption/config'
import { recordMap } from '@lib/utils/record/recordMap'

type Input = {
  keyShares: VaultKeyShares
  key: string
}

export const encryptVaultKeyShares = ({ keyShares, key }: Input) =>
  recordMap(keyShares, value =>
    encryptWithAesGcm({
      key,
      value: Buffer.from(value, plainTextEncoding),
    }).toString(encryptedEncoding)
  )

export const decryptVaultKeyShares = ({ keyShares, key }: Input) =>
  recordMap(keyShares, value =>
    decryptWithAesGcm({
      key,
      value: Buffer.from(value, encryptedEncoding),
    }).toString(plainTextEncoding)
  )
