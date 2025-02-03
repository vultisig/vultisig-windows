import { getHexEncodedRandomBytes } from '../../../../chain/utils/getHexEncodedRandomBytes';

export const generateHexChainCode = () => getHexEncodedRandomBytes(32);
