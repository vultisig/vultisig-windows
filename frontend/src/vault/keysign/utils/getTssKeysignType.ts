import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { Chain, edDsaChains, TssKeysignType } from '../../../model/chain';

export const getTssKeysignType = (chain: Chain) => {
  return isOneOf(chain, edDsaChains)
    ? TssKeysignType.EdDSA
    : TssKeysignType.ECDSA;
};
