/*

WARNING: Never change the string of the enum values. It must match with IOS/Android app. They are case sensitive!

*/

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

export const maxSendAmountEnabledChains = Object.values(UtxoChain);
