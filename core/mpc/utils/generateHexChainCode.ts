import { getHexEncodedRandomBytes } from '@lib/utils/crypto/getHexEncodedRandomBytes'

export const generateHexChainCode = () => getHexEncodedRandomBytes(32)
