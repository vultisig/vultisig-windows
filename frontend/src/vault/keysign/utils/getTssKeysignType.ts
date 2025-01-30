import {
  TssKeysignType,
  tssKeysignTypeRecord,
} from '../../../chain/keysign/TssKeysignType';
import { Chain, getChainKind } from '../../../model/chain';

export const getTssKeysignType = (chain: Chain): TssKeysignType => {
  return tssKeysignTypeRecord[getChainKind(chain)];
};
