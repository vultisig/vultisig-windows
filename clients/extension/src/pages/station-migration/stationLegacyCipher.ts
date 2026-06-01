const stationMessagePrefix = 'STATION:'

type Pbkdf2Hash = 'SHA-1' | 'SHA-256'

type DecryptStationLegacyCiphertextInput = {
  ciphertext: string
  password: string
  iterations?: number
  hasStationPrefix?: boolean
}

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const hexToBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) {
    throw new Error('Invalid hex')
  }

  return Uint8Array.from({ length: hex.length / 2 }, (_, index) =>
    Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  )
}

const base64ToBytes = (value: string): Uint8Array =>
  Uint8Array.from(atob(value), character => character.charCodeAt(0))

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)

  return copy.buffer
}

const importPasswordKey = (password: string) =>
  crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

const deriveAesKey = async ({
  hash,
  iterations,
  password,
  salt,
}: {
  hash: Pbkdf2Hash
  iterations: number
  password: string
  salt: Uint8Array
}) => {
  const passwordKey = await importPasswordKey(password)

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash,
      salt: toArrayBuffer(salt),
      iterations,
    },
    passwordKey,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  )
}

const decryptWithHash = async ({
  ciphertext,
  hasStationPrefix = true,
  iterations = 20_000,
  password,
  hash,
}: DecryptStationLegacyCiphertextInput & { hash: Pbkdf2Hash }) => {
  const salt = hexToBytes(ciphertext.slice(0, 32))
  const iv = hexToBytes(ciphertext.slice(32, 64))
  const encrypted = base64ToBytes(ciphertext.slice(64))
  const key = await deriveAesKey({ hash, iterations, password, salt })
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encrypted)
  )
  const decoded = textDecoder.decode(decrypted)

  if (!hasStationPrefix) {
    if (!decoded) throw new Error('Incorrect password')
    return decoded
  }

  if (!decoded.startsWith(stationMessagePrefix)) {
    throw new Error('Incorrect password')
  }

  return decoded.slice(stationMessagePrefix.length)
}

export const decryptStationLegacyCiphertext = async (
  input: DecryptStationLegacyCiphertextInput
) => {
  const hashes: Pbkdf2Hash[] = ['SHA-256', 'SHA-1']

  for (const hash of hashes) {
    try {
      return await decryptWithHash({ ...input, hash })
    } catch {
      // Try the next CryptoJS PBKDF2 default. Station versions in the wild
      // can have either SHA-256 or SHA-1 depending on bundled crypto-js.
    }
  }

  throw new Error('Incorrect password')
}

export const decryptStationLegacySecret = async ({
  ciphertext,
  password,
}: {
  ciphertext: string
  password: string
}) => {
  try {
    return await decryptStationLegacyCiphertext({ ciphertext, password })
  } catch {
    return decryptStationLegacyCiphertext({
      ciphertext,
      password,
      iterations: 100,
      hasStationPrefix: false,
    })
  }
}
