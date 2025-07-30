import { Chain } from '@core/chain/Chain'
import { ChainKind, DeriveChainKind, getChainKind } from '@core/chain/ChainKind'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

type DecodeTxInput<T extends Chain = Chain> = {
  chain: T
  compiledTx: Uint8Array<ArrayBufferLike>
}

type ChainKindToDecodedOutput = {
  evm: Omit<TW.Ethereum.Proto.SigningOutput, 'errorMessage'>
  utxo: Omit<TW.Bitcoin.Proto.SigningOutput, 'errorMessage'>
  solana: Omit<TW.Solana.Proto.SigningOutput, 'errorMessage'>
  cosmos: Omit<TW.Cosmos.Proto.SigningOutput, 'errorMessage'>
  polkadot: Omit<TW.Polkadot.Proto.SigningOutput, 'errorMessage'>
  sui: Omit<TW.Sui.Proto.SigningOutput, 'errorMessage'>
  ton: Omit<TW.TheOpenNetwork.Proto.SigningOutput, 'errorMessage'>
  ripple: Omit<TW.Ripple.Proto.SigningOutput, 'errorMessage'>
  tron: Omit<TW.Tron.Proto.SigningOutput, 'errorMessage'>
  cardano: Omit<TW.Cardano.Proto.SigningOutput, 'errorMessage'>
}

export type DecodedTx<T extends Chain = Chain> = Omit<
  ChainKindToDecodedOutput[DeriveChainKind<T>],
  'errorMessage' | 'error' | 'toJSON'
>

type DecodedOutput<T extends Chain> = DecodedTx<T>

const decoders: Record<
  ChainKind,
  (compiledTx: Uint8Array<ArrayBufferLike>) => any
> = {
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
}

export const decodeTx = <T extends Chain>({
  chain,
  compiledTx,
}: DecodeTxInput<T>): DecodedOutput<T> => {
  const chainKind = getChainKind(chain)
  const decoder = decoders[chainKind]
  const { errorMessage, ...output } = decoder(compiledTx)

  assertErrorMessage(errorMessage)

  return output as DecodedOutput<T>
}
