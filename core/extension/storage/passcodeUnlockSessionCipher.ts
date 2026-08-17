import { base64Encode } from '@vultisig/lib-utils/base64Encode'
import { fromBase64 } from '@vultisig/lib-utils/fromBase64'

import { getPasscodeUnlockSessionKey } from './passcodeUnlockSessionKey'

const ivLength = 12

/** A passcode at rest: AES-GCM ciphertext plus the nonce it was sealed under. */
type SealedPasscode = {
  iv: string
  sealedPasscode: string
}

// WebCrypto wants a DOM `BufferSource`; `@types/node`'s `Buffer` isn't
// assignable (it may be SharedArrayBuffer backed), so copy into a plain
// `ArrayBuffer`-backed `Uint8Array`.
const toBytes = (value: Buffer): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(value.length)
  bytes.set(value)
  return bytes
}

/**
 * Seals a passcode under the non-extractable session key so the unlock session
 * never holds it in the clear. A fresh nonce per write keeps repeated unlocks
 * from producing identical records.
 */
export const sealPasscode = async (
  passcode: string
): Promise<SealedPasscode> => {
  const key = await getPasscodeUnlockSessionKey()
  const iv = crypto.getRandomValues(new Uint8Array(ivLength))

  const sealed = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(passcode)
  )

  return {
    iv: base64Encode(iv),
    sealedPasscode: base64Encode(new Uint8Array(sealed)),
  }
}

/**
 * Recovers a sealed passcode. Rejects when the record was sealed under a key
 * this context no longer has, which the caller treats as "no session".
 */
export const openPasscode = async ({
  iv,
  sealedPasscode,
}: SealedPasscode): Promise<string> => {
  const key = await getPasscodeUnlockSessionKey()

  const opened = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toBytes(fromBase64(iv)) },
    key,
    toBytes(fromBase64(sealedPasscode))
  )

  return new TextDecoder().decode(opened)
}
