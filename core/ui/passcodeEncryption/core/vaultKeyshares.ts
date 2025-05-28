import { VaultKeyshares } from '@core/ui/vault/Vault'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { recordMap } from '@lib/utils/record/recordMap'

type Input = {
  keyshares: VaultKeyshares
  key: string
}

const decryptedEncoding: BufferEncoding = 'base64'
const encryptedEncoding: BufferEncoding = 'utf8'

export const encryptVaultKeyshares = ({ keyshares, key }: Input) =>
  recordMap(keyshares, value =>
    encryptWithAesGcm({
      key,
      value: Buffer.from(value, encryptedEncoding),
    }).toString(decryptedEncoding)
  )

export const decryptVaultKeyshares = ({ keyshares, key }: Input) =>
  recordMap(keyshares, value =>
    decryptWithAesGcm({
      key,
      value: Buffer.from(value, decryptedEncoding),
    }).toString(encryptedEncoding)
  )
