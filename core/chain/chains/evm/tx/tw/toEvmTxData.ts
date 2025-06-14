import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

export const toEvmTxData = (data: string) =>
  Buffer.from(stripHexPrefix(data), 'hex')
