import { TssKeysignType } from '../../chain/keysign/TssKeysignType';

export type VaultPublicKey = {
  value: string;
  type: TssKeysignType;
  hexChainCode: string;
};
