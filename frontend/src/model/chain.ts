/*

WARNING: Never change the string of the enum values. It must match with IOS/Android app. They are case sensitive!

*/

import { isOneOf } from '../lib/utils/array/isOneOf';

export enum EvmChain {
  Arbitrum = 'Arbitrum',
  Avalanche = 'Avalanche',
  Base = 'Base',
  CronosChain = 'CronosChain',
  BSC = 'BSC',
  Blast = 'Blast',
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
  Polygon = 'Polygon',
  Zksync = 'Zksync',
}

export const evmChainIds: Record<EvmChain, number> = {
  [EvmChain.Arbitrum]: 42161,
  [EvmChain.Avalanche]: 43114,
  [EvmChain.Base]: 8453,
  [EvmChain.CronosChain]: 25,
  [EvmChain.BSC]: 56,
  [EvmChain.Blast]: 81457,
  [EvmChain.Ethereum]: 1,
  [EvmChain.Optimism]: 10,
  [EvmChain.Polygon]: 137,
  [EvmChain.Zksync]: 324,
};

export enum UtxoChain {
  Bitcoin = 'Bitcoin',
  BitcoinCash = 'Bitcoin-Cash',
  Litecoin = 'Litecoin',
  Dogecoin = 'Dogecoin',
  Dash = 'Dash',
}

export enum CosmosChain {
  THORChain = 'THORChain',
  Cosmos = 'Cosmos',
  Osmosis = 'Osmosis',
  MayaChain = 'MayaChain',
  Dydx = 'Dydx',
  Kujira = 'Kujira',
  Terra = 'Terra',
  TerraClassic = 'TerraClassic',
  Noble = 'Noble',
}

export enum OtherChain {
  Sui = 'Sui',
  Solana = 'Solana',
  Polkadot = 'Polkadot',
  Ton = 'Ton',
  Ripple = 'Ripple',
}

export const Chain = {
  ...EvmChain,
  ...UtxoChain,
  ...CosmosChain,
  ...OtherChain,
};

export type Chain = EvmChain | UtxoChain | CosmosChain | OtherChain;

export enum TssKeysignType {
  ECDSA = 'ECDSA',
  EdDSA = 'EdDSA',
}
export enum TssAction {
  KEYGEN = 'KEYGEN',
  RESHARE = 'RESHARE',
}

export const chainKinds = [
  'evm',
  'utxo',
  'cosmos',
  'solana',
  'polkadot',
  'ton',
  'sui',
  'ripple',
] as const;

export type ChainKind = (typeof chainKinds)[number];

export const chainKindRecord: Record<Chain, ChainKind> = {
  [EvmChain.Arbitrum]: 'evm',
  [EvmChain.Avalanche]: 'evm',
  [EvmChain.Base]: 'evm',
  [EvmChain.CronosChain]: 'evm',
  [EvmChain.BSC]: 'evm',
  [EvmChain.Blast]: 'evm',
  [EvmChain.Ethereum]: 'evm',
  [EvmChain.Optimism]: 'evm',
  [EvmChain.Polygon]: 'evm',
  [EvmChain.Zksync]: 'evm',

  [UtxoChain.Bitcoin]: 'utxo',
  [UtxoChain.BitcoinCash]: 'utxo',
  [UtxoChain.Litecoin]: 'utxo',
  [UtxoChain.Dogecoin]: 'utxo',
  [UtxoChain.Dash]: 'utxo',

  [CosmosChain.THORChain]: 'cosmos',
  [CosmosChain.Cosmos]: 'cosmos',
  [CosmosChain.Osmosis]: 'cosmos',
  [CosmosChain.MayaChain]: 'cosmos',
  [CosmosChain.Dydx]: 'cosmos',
  [CosmosChain.Kujira]: 'cosmos',
  [CosmosChain.Terra]: 'cosmos',
  [CosmosChain.TerraClassic]: 'cosmos',
  [CosmosChain.Noble]: 'cosmos',

  [OtherChain.Sui]: 'sui',

  [OtherChain.Solana]: 'solana',

  [OtherChain.Polkadot]: 'polkadot',

  [OtherChain.Ton]: 'ton',

  [OtherChain.Ripple]: 'ripple',
};

export class ChainUtils {
  static stringToChain(chain: string): Chain | undefined {
    return isOneOf(chain, Object.values(Chain));
  }
  static stringToTssAction(action: string): TssAction | undefined {
    return isOneOf(action, Object.values(TssAction));
  }

  static getTssKeysignType(chain: Chain): TssKeysignType {
    switch (chain) {
      case Chain.Solana:
        return TssKeysignType.EdDSA;
      case Chain.Polkadot:
        return TssKeysignType.EdDSA;
      case Chain.Sui:
        return TssKeysignType.EdDSA;
      case Chain.Ton:
        return TssKeysignType.EdDSA;
      default:
        return TssKeysignType.ECDSA;
    }
  }
}
