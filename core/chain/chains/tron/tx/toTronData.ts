import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

export const toTronData = (data: string) =>
  data.startsWith('0x')
    ? Buffer.from(stripHexPrefix(data), 'hex')
    : Buffer.from(data, 'utf8')
