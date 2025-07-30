import { Chain } from '@core/chain/Chain'
import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

type DecodeTxInput<T extends Chain = Chain> = {
  chain: T
  compiledTx: Uint8Array<ArrayBufferLike>
}

const decoders = {
  evm: TW.Ethereum.Proto.SigningOutput.decode,
  utxo: TW.Bitcoin.Proto.SigningOutput.decode,
  solana: TW.Solana.Proto.SigningOutput.decode,
  cosmos: TW.Cosmos.Proto.SigningOutput.decode,
  polkadot: TW.Polkadot.Proto.SigningOutput.decode,
  sui: TW.Sui.Proto.SigningOutput.decode,
  ton: TW.TheOpenNetwork.Proto.SigningOutput.decode,
  ripple: TW.Ripple.Proto.SigningOutput.decode,
  tron: TW.Tron.Proto.SigningOutput.decode,
  cardano: TW.Cardano.Proto.SigningOutput.decode,
} as const

type ChainKindToDecodedOutput = {
  [K in keyof typeof decoders]: ReturnType<(typeof decoders)[K]>
}

export type DecodedTx<T extends Chain = Chain> = Omit<
  ChainKindToDecodedOutput[DeriveChainKind<T>],
  'errorMessage' | 'error' | 'toJSON'
>

export const decodeTx = <T extends Chain>({
  chain,
  compiledTx,
}: DecodeTxInput<T>): DecodedTx<T> => {
  const chainKind = getChainKind(chain)
  const decoder = decoders[chainKind]
  const { errorMessage, ...output } = decoder(compiledTx)

  assertErrorMessage(errorMessage)

  return output as unknown as DecodedTx<T>
}
