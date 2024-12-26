import { Chain } from '../../model/chain';

export type TssKeysignType = 'ecdsa' | 'eddsa';

export const edDsaChains = [
  Chain.Solana,
  Chain.Polkadot,
  Chain.Sui,
  Chain.Ton,
] as const;
