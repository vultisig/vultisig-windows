import { VaultKeyshares } from '@core/ui/vault/Vault'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { recordMap } from '@lib/utils/record/recordMap'

import { decryptedPasscodeEncoding, encryptedPasscodeEncoding } from './config'

type Input = {
  keyshares: VaultKeyshares
  key: string
}

export const encryptVaultKeyshares = ({ keyshares, key }: Input) =>
  recordMap(keyshares, value =>
    encryptWithAesGcm({
      key,
      value: Buffer.from(value, decryptedPasscodeEncoding),
    }).toString(encryptedPasscodeEncoding)
  )

export const decryptVaultKeyshares = ({ keyshares, key }: Input) =>
  recordMap(keyshares, value =>
    decryptWithAesGcm({
      key,
      value: Buffer.from(value, encryptedPasscodeEncoding),
    }).toString(decryptedPasscodeEncoding)
  )
