import { PublicKeyType } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { Chain } from '../../model/chain';

export type TssKeysignType = 'ecdsa' | 'eddsa';

export const walletCorePublicKeyType: Record<TssKeysignType, PublicKeyType> = {
  ecdsa: PublicKeyType.secp256k1,
  eddsa: PublicKeyType.ed25519,
};

export const edDsaChains = [
  Chain.Solana,
  Chain.Polkadot,
  Chain.Sui,
  Chain.Ton,
] as const;
