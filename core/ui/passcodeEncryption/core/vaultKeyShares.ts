import { Chain } from '@core/chain/Chain'
import { VaultKeyShares } from '@core/mpc/vault/Vault'
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

type VaultAllKeyShares = {
  keyShares: VaultKeyShares
  chainKeyShares?: Partial<Record<Chain, string>>
}

type EncryptInput = VaultAllKeyShares & { key: string }

export const encryptVaultAllKeyShares = ({
  keyShares,
  chainKeyShares,
  key,
}: EncryptInput): VaultAllKeyShares => ({
  keyShares: encryptVaultKeyShares({ keyShares, key }),
  chainKeyShares: chainKeyShares
    ? (recordMap(chainKeyShares as Record<Chain, string>, value =>
        encryptWithAesGcm({
          key,
          value: Buffer.from(value as string, plainTextEncoding),
        }).toString(encryptedEncoding)
      ) as Partial<Record<Chain, string>>)
    : undefined,
})

export const decryptVaultAllKeyShares = ({
  keyShares,
  chainKeyShares,
  key,
}: EncryptInput): VaultAllKeyShares => ({
  keyShares: decryptVaultKeyShares({ keyShares, key }),
  chainKeyShares: chainKeyShares
    ? (recordMap(chainKeyShares as Record<Chain, string>, value =>
        decryptWithAesGcm({
          key,
          value: Buffer.from(value as string, encryptedEncoding),
        }).toString(plainTextEncoding)
      ) as Partial<Record<Chain, string>>)
    : undefined,
})
