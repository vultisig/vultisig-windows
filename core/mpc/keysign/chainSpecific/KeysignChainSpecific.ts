import { Chain } from '@core/chain/Chain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'

export type KeysignChainSpecific = Exclude<
  KeysignPayload['blockchainSpecific'],
  { case: undefined; value?: undefined }
>

export type KeysignChainSpecificKey = KeysignChainSpecific['case']

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
  [Chain.Mantle]: 'ethereumSpecific',
  [Chain.Hyperliquid]: 'ethereumSpecific',
  [Chain.Sei]: 'ethereumSpecific',

  [Chain.Bitcoin]: 'utxoSpecific',
  [Chain.BitcoinCash]: 'utxoSpecific',
  [Chain.Litecoin]: 'utxoSpecific',
  [Chain.Dogecoin]: 'utxoSpecific',
  [Chain.Dash]: 'utxoSpecific',
  [Chain.Zcash]: 'utxoSpecific',

  [Chain.Cosmos]: 'cosmosSpecific',
  [Chain.Osmosis]: 'cosmosSpecific',
  [Chain.Dydx]: 'cosmosSpecific',
  [Chain.Kujira]: 'cosmosSpecific',
  [Chain.Terra]: 'cosmosSpecific',
  [Chain.TerraClassic]: 'cosmosSpecific',
  [Chain.Noble]: 'cosmosSpecific',
  [Chain.Akash]: 'cosmosSpecific',

  [Chain.THORChain]: 'thorchainSpecific',

  [Chain.MayaChain]: 'mayaSpecific',

  [Chain.Sui]: 'suicheSpecific',

  [Chain.Solana]: 'solanaSpecific',

  [Chain.Polkadot]: 'polkadotSpecific',

  [Chain.Ton]: 'tonSpecific',

  [Chain.Ripple]: 'rippleSpecific',

  [Chain.Tron]: 'tronSpecific',

  [Chain.Cardano]: 'cardano',
} as const satisfies Record<Chain, KeysignChainSpecificKey>

export const getBlockchainSpecificValue = <T extends KeysignChainSpecificKey>(
  blockchainSpecific: KeysignPayload['blockchainSpecific'],
  expectedCase: T
): Extract<KeysignChainSpecific, { case: T }>['value'] => {
  if (!blockchainSpecific.case) {
    throw new Error('Invalid blockchain specific')
  }

  return getDiscriminatedUnionValue(
    blockchainSpecific,
    'case',
    'value',
    expectedCase
  ) as any
}
