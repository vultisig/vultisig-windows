import { TssKeysignType } from '../../model/chain';

export type VaultPublicKey = {
  value: string;
  type: TssKeysignType;
  hexChainCode: string;
};
