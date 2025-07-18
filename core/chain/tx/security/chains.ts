import { ChainsOfKind } from '../../ChainKind'

export type BlockaidSupportedChainKind = 'evm' | 'utxo' | 'solana' | 'sui'

export type BlockaidSupportedChain = ChainsOfKind<BlockaidSupportedChainKind>
