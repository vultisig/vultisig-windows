import { ChainKind } from '../ChainKind'

export type SignatureFormat = 'raw' | 'der' | 'rawWithRecoveryId'

export const signatureFormats: Record<ChainKind, SignatureFormat> = {
  evm: 'rawWithRecoveryId',
  cosmos: 'rawWithRecoveryId',
  sui: 'raw',
  solana: 'raw',
  polkadot: 'raw',
  ton: 'raw',
  utxo: 'der',
  ripple: 'rawWithRecoveryId',
  tron: 'rawWithRecoveryId',
}
