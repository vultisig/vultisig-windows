import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

export const toTwTransferData = (memo: string | undefined) => {
  if (memo && memo.startsWith('0x')) {
    return Buffer.from(stripHexPrefix(memo), 'hex')
  }

  return Buffer.from(memo ?? '', 'utf8')
}

export const toTwAmount = (amount: string) =>
  Buffer.from(stripHexPrefix(bigIntToHex(BigInt(amount))), 'hex')
