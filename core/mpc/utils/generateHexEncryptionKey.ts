import { getHexEncodedRandomBytes } from '@lib/utils/crypto/getHexEncodedRandomBytes'

export const generateHexEncryptionKey = () => getHexEncodedRandomBytes(32)
