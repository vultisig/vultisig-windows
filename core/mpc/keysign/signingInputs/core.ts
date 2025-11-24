import { ChainKind } from '@core/chain/ChainKind'
import { TW } from '@trustwallet/wallet-core'

export const signingInputClasses = {
  cardano: TW.Cardano.Proto.SigningInput,
  cosmos: TW.Cosmos.Proto.SigningInput,
  evm: TW.Ethereum.Proto.SigningInput,
  polkadot: TW.Polkadot.Proto.SigningInput,
  ripple: TW.Ripple.Proto.SigningInput,
  solana: TW.Solana.Proto.SigningInput,
  sui: TW.Sui.Proto.SigningInput,
  ton: TW.TheOpenNetwork.Proto.SigningInput,
  tron: TW.Tron.Proto.SigningInput,
  utxo: TW.Bitcoin.Proto.SigningInput,
} as const satisfies Record<ChainKind, unknown>

export type SigningInput<T extends ChainKind> = InstanceType<
  (typeof signingInputClasses)[T]
>
