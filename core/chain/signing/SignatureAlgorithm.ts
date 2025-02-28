import { ChainKind } from '../ChainKind'

export type SignatureAlgorithm = 'ecdsa' | 'eddsa'

export const signatureAlgorithms: Record<ChainKind, SignatureAlgorithm> = {
  evm: 'ecdsa',
  utxo: 'ecdsa',
  cosmos: 'ecdsa',
  sui: 'eddsa',
  solana: 'eddsa',
  polkadot: 'eddsa',
  ton: 'eddsa',
  ripple: 'ecdsa',
  tron: 'ecdsa',
}
