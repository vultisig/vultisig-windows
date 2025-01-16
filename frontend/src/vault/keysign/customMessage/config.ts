import { TssKeysignType } from '../../../chain/keysign/TssKeysignType';
import { Chain } from '../../../model/chain';

const tssType: TssKeysignType = 'ecdsa';

export const customMessageConfig = {
  chain: Chain.Ethereum,
  tssType,
};
