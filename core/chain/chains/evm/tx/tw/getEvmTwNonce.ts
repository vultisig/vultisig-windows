import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

export const getEvmTwNonce = (nonce: bigint) => {
  return Buffer.from(stripHexPrefix(bigIntToHex(nonce).padStart(2, '0')), 'hex')
}
