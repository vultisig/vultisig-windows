import { ChainKind } from '../../model/chain';

export type TssKeysignType = 'ecdsa' | 'eddsa';

export const tssKeysignTypeRecord: Record<ChainKind, TssKeysignType> = {
  evm: 'ecdsa',
  utxo: 'ecdsa',
  cosmos: 'ecdsa',
  sui: 'eddsa',
  solana: 'eddsa',
  polkadot: 'eddsa',
  ton: 'eddsa',
  ripple: 'ecdsa',
};
