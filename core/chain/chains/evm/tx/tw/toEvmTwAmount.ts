import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

export const toEvmTwAmount = (amount: string | number | bigint) =>
  Buffer.from(stripHexPrefix(bigIntToHex(BigInt(amount))), 'hex')
