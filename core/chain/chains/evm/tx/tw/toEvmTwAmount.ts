import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

export const toEvmTwAmount = (amount: string | number) =>
  Buffer.from(stripHexPrefix(bigIntToHex(BigInt(amount))), 'hex')
