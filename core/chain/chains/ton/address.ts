import { fromBase64 } from '@lib/utils/fromBase64'

/** Converts base64url encoding to standard base64 so `Buffer.from` can decode it. */
const fromBase64Url = (value: string): Buffer => {
  const standardBase64 = value.replace(/-/g, '+').replace(/_/g, '/')
  return fromBase64(standardBase64)
}

/**
 * Converts a user-friendly TON address (EQ.../UQ...) to raw format (workchain:hex).
 * The toncenter v3 API requires raw addresses.
 */
export const tonAddressToRaw = (userFriendlyAddress: string): string => {
  const decoded = fromBase64Url(userFriendlyAddress)
  const workchain = decoded[1] >= 128 ? decoded[1] - 256 : decoded[1]
  const hash = decoded.subarray(2, 34).toString('hex')

  return `${workchain}:${hash}`
}
