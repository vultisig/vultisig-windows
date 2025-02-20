import { getHexEncodedRandomBytes } from '../../../../chain/utils/getHexEncodedRandomBytes'

export const generateHexEncryptionKey = () => getHexEncodedRandomBytes(32)
