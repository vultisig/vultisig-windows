import { ChainKind, DeriveChainKind, getChainKind } from '@core/chain/ChainKind'
import { TW } from '@trustwallet/wallet-core'

import { Chain } from '../Chain'

const signingOutputs = {
  evm: TW.Ethereum.Proto.SigningOutput,
  utxo: TW.Bitcoin.Proto.SigningOutput,
  solana: TW.Solana.Proto.SigningOutput,
  cosmos: TW.Cosmos.Proto.SigningOutput,
  polkadot: TW.Polkadot.Proto.SigningOutput,
  sui: TW.Sui.Proto.SigningOutput,
  ton: TW.TheOpenNetwork.Proto.SigningOutput,
  ripple: TW.Ripple.Proto.SigningOutput,
  tron: TW.Tron.Proto.SigningOutput,
  cardano: TW.Cardano.Proto.SigningOutput,
} as const satisfies Record<ChainKind, unknown>

type PotentialSigningOutput<T extends Chain = Chain> = InstanceType<
  (typeof signingOutputs)[DeriveChainKind<T>]
>

export type SigningOutput<T extends Chain = Chain> = Omit<
  PotentialSigningOutput<T>,
  'errorMessage' | 'error'
>

const assertSigningOutput = <T extends Chain = Chain>(
  output: PotentialSigningOutput<T>
): SigningOutput<T> => {
  if (output.errorMessage) {
    throw new Error(`Invalid signing output: ${output.errorMessage}`)
  }

  return output
}

export const decodeSigningOutput = <T extends Chain = Chain>(
  chain: T,
  data: Uint8Array<ArrayBufferLike>
): SigningOutput<T> => {
  const chainKind = getChainKind(chain)

  const output = signingOutputs[chainKind].decode(
    data
  ) as PotentialSigningOutput<T>

  return assertSigningOutput(output)
}

export type SerializedSigningOutput = Record<string, unknown>

export const deserializeSigningOutput = <T extends Chain = Chain>(
  chain: T,
  data: SerializedSigningOutput
): SigningOutput<T> => {
  const chainKind = getChainKind(chain)

  const output = signingOutputs[chainKind].fromObject(
    data
  ) as PotentialSigningOutput<T>

  return assertSigningOutput(output)
}
