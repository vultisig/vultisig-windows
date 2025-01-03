import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../model/chain';

export type KeysignChainSpecific = Exclude<
  KeysignPayload['blockchainSpecific'],
  { case: undefined; value?: undefined }
>;

export type KeysignChainSpecificKey = KeysignChainSpecific['case'];

export type KeysignChainSpecificValue = KeysignChainSpecific['value'];

export const chainSpecificRecord = {
  [Chain.Arbitrum]: 'ethereumSpecific',
  [Chain.Avalanche]: 'ethereumSpecific',
  [Chain.Base]: 'ethereumSpecific',
  [Chain.CronosChain]: 'ethereumSpecific',
  [Chain.BSC]: 'ethereumSpecific',
  [Chain.Blast]: 'ethereumSpecific',
  [Chain.Ethereum]: 'ethereumSpecific',
  [Chain.Optimism]: 'ethereumSpecific',
  [Chain.Polygon]: 'ethereumSpecific',
  [Chain.Zksync]: 'ethereumSpecific',

  [Chain.Bitcoin]: 'utxoSpecific',
  [Chain.BitcoinCash]: 'utxoSpecific',
  [Chain.Litecoin]: 'utxoSpecific',
  [Chain.Dogecoin]: 'utxoSpecific',
  [Chain.Dash]: 'utxoSpecific',

  [Chain.Cosmos]: 'cosmosSpecific',
  [Chain.Osmosis]: 'cosmosSpecific',
  [Chain.Dydx]: 'cosmosSpecific',
  [Chain.Kujira]: 'cosmosSpecific',
  [Chain.Terra]: 'cosmosSpecific',
  [Chain.TerraClassic]: 'cosmosSpecific',
  [Chain.Noble]: 'cosmosSpecific',

  [Chain.THORChain]: 'thorchainSpecific',

  [Chain.MayaChain]: 'mayaSpecific',

  [Chain.Sui]: 'suicheSpecific',

  [Chain.Solana]: 'solanaSpecific',

  [Chain.Polkadot]: 'polkadotSpecific',

  [Chain.Ton]: 'tonSpecific',

  [Chain.Ripple]: 'rippleSpecific',
} as const satisfies Record<Chain, KeysignChainSpecificKey>;

export type ChainsBySpecific<T extends KeysignChainSpecificKey> = {
  [K in keyof typeof chainSpecificRecord]: (typeof chainSpecificRecord)[K] extends T
    ? K
    : never;
}[keyof typeof chainSpecificRecord];
