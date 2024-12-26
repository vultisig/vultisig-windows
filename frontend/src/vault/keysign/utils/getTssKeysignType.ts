import {
  edDsaChains,
  TssKeysignType,
} from '../../../chain/keysign/TssKeysignType';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { Chain } from '../../../model/chain';

export const getTssKeysignType = (chain: Chain): TssKeysignType => {
  return isOneOf(chain, edDsaChains) ? 'eddsa' : 'ecdsa';
};
