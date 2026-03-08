import { VaultAllKeyShares, VaultKeyShares } from '@core/mpc/vault/Vault'
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

const encryptVaultKeyShares = ({ keyShares, key }: Input) =>
  recordMap(keyShares, value =>
    encryptWithAesGcm({
      key,
      value: Buffer.from(value, plainTextEncoding),
    }).toString(encryptedEncoding)
  )

const decryptVaultKeyShares = ({ keyShares, key }: Input) =>
  recordMap(keyShares, value =>
    decryptWithAesGcm({
      key,
      value: Buffer.from(value, encryptedEncoding),
    }).toString(plainTextEncoding)
  )

type EncryptInput = VaultAllKeyShares & { key: string }

export const encryptVaultAllKeyShares = ({
  keyShares,
  chainKeyShares,
  keyShareMldsa,
  key,
}: EncryptInput): VaultAllKeyShares => ({
  keyShares: encryptVaultKeyShares({ keyShares, key }),
  chainKeyShares: chainKeyShares
    ? recordMap(chainKeyShares, value =>
        encryptWithAesGcm({
          key,
          value: Buffer.from(value, plainTextEncoding),
        }).toString(encryptedEncoding)
      )
    : undefined,
  keyShareMldsa: keyShareMldsa
    ? encryptWithAesGcm({
        key,
        value: Buffer.from(keyShareMldsa, plainTextEncoding),
      }).toString(encryptedEncoding)
    : undefined,
})

export const decryptVaultAllKeyShares = ({
  keyShares,
  chainKeyShares,
  keyShareMldsa,
  key,
}: EncryptInput): VaultAllKeyShares => ({
  keyShares: decryptVaultKeyShares({ keyShares, key }),
  chainKeyShares: chainKeyShares
    ? recordMap(chainKeyShares, value =>
        decryptWithAesGcm({
          key,
          value: Buffer.from(value, encryptedEncoding),
        }).toString(plainTextEncoding)
      )
    : undefined,
  keyShareMldsa: keyShareMldsa
    ? decryptWithAesGcm({
        key,
        value: Buffer.from(keyShareMldsa, encryptedEncoding),
      }).toString(plainTextEncoding)
    : undefined,
})
