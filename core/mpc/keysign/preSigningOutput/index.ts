import { Chain } from '@core/chain/Chain'
import { ChainKind, DeriveChainKind, getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW, WalletCore } from '@trustwallet/wallet-core'

type Input<T extends Chain = Chain> = {
  walletCore: WalletCore
  chain: T
  txInputData: Uint8Array
}

const preSigningOutputClasses = {
  utxo: TW.Bitcoin.Proto.PreSigningOutput,
  solana: TW.Solana.Proto.PreSigningOutput,
  evm: TW.TxCompiler.Proto.PreSigningOutput,
  cosmos: TW.TxCompiler.Proto.PreSigningOutput,
  polkadot: TW.TxCompiler.Proto.PreSigningOutput,
  ton: TW.TxCompiler.Proto.PreSigningOutput,
  sui: TW.TxCompiler.Proto.PreSigningOutput,
  ripple: TW.TxCompiler.Proto.PreSigningOutput,
  tron: TW.TxCompiler.Proto.PreSigningOutput,
  cardano: TW.TxCompiler.Proto.PreSigningOutput,
} as const satisfies Record<ChainKind, unknown>

type PreSigningOutput<T extends ChainKind> = InstanceType<
  (typeof preSigningOutputClasses)[T]
>

export const getPreSigningOutput = <T extends Chain>({
  walletCore,
  txInputData,
  chain,
}: Input<T>): PreSigningOutput<DeriveChainKind<T>> => {
  const preHashes = walletCore.TransactionCompiler.preImageHashes(
    getCoinType({
      walletCore,
      chain,
    }),
    txInputData
  )

  const chainKind = getChainKind(chain)

  const PreSigningOutputClass = preSigningOutputClasses[chainKind]

  const output = PreSigningOutputClass.decode(preHashes)

  assertErrorMessage(output.errorMessage)

  return output as PreSigningOutput<DeriveChainKind<T>>
}
