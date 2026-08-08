import {
  decryptStationLegacyCiphertext,
  decryptStationLegacySecret,
} from '@clients/extension/src/pages/station-migration/stationLegacyCipher'
import { describe, expect, it } from 'vitest'

const textEncoder = new TextEncoder()

const toHex = (bytes: Uint8Array) =>
  [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))

const toBytes = (text: string) => textEncoder.encode(text)

const createCiphertext = async ({
  hash = 'SHA-256',
  iterations,
  message,
  password,
  stationPrefix = true,
}: {
  hash?: 'SHA-1' | 'SHA-256'
  iterations: number
  message: string
  password: string
  stationPrefix?: boolean
}) => {
  const salt = Uint8Array.from({ length: 16 }, (_, index) => index + 1)
  const iv = Uint8Array.from({ length: 16 }, (_, index) => index + 17)
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    toBytes(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash, salt, iterations },
    passwordKey,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt']
  )
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    toBytes(`${stationPrefix ? 'STATION:' : ''}${message}`)
  )

  return `${toHex(salt)}${toHex(iv)}${toBase64(new Uint8Array(encrypted))}`
}

describe('station legacy cipher', () => {
  it('decrypts Station-prefixed AES-CBC/PBKDF2 ciphertext', async () => {
    const ciphertext = await createCiphertext({
      iterations: 20_000,
      message: 'seed-hex',
      password: 'station-password',
    })

    await expect(
      decryptStationLegacyCiphertext({
        ciphertext,
        password: 'station-password',
      })
    ).resolves.toBe('seed-hex')
  })

  it('decrypts Station-prefixed ciphertext from CryptoJS SHA-1 PBKDF2 builds', async () => {
    const ciphertext = await createCiphertext({
      hash: 'SHA-1',
      iterations: 20_000,
      message: 'seed-hex',
      password: 'station-password',
    })

    await expect(
      decryptStationLegacySecret({
        ciphertext,
        password: 'station-password',
      })
    ).resolves.toBe('seed-hex')
  })

  it('falls back to legacy 100-iteration ciphertext without Station prefix', async () => {
    const ciphertext = await createCiphertext({
      iterations: 100,
      message: 'private-key-hex',
      password: 'station-password',
      stationPrefix: false,
    })

    await expect(
      decryptStationLegacySecret({
        ciphertext,
        password: 'station-password',
      })
    ).resolves.toBe('private-key-hex')
  })

  it('rejects incorrect passwords', async () => {
    const ciphertext = await createCiphertext({
      iterations: 20_000,
      message: 'seed-hex',
      password: 'station-password',
    })

    await expect(
      decryptStationLegacySecret({
        ciphertext,
        password: 'wrong-password',
      })
    ).rejects.toThrow('Incorrect password')
  })
})
