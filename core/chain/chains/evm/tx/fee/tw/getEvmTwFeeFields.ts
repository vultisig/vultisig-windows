import { match } from '@lib/utils/match'
import { TW } from '@trustwallet/wallet-core'

import { EvmChain } from '../../../../../Chain'
import { toEvmTwAmount } from '../../tw/toEvmTwAmount'
import { evmChainTxFeeFormat, EvmTxFeeFormat } from '..'

export type GetEvmTwFeeFieldsInput = {
  chain: EvmChain
  maxFeePerGasWei: bigint
  priorityFee: bigint
  gasLimit: bigint
}

type TwFeeFields =
  | Pick<
      TW.Ethereum.Proto.SigningInput,
      'txMode' | 'maxFeePerGas' | 'maxInclusionFeePerGas'
    >
  | Pick<TW.Ethereum.Proto.SigningInput, 'gasLimit' | 'gasPrice' | 'txMode'>

export const getEvmTwFeeFields = ({
  chain,
  maxFeePerGasWei,
  priorityFee,
  gasLimit,
}: GetEvmTwFeeFieldsInput) => {
  const feeFormat = evmChainTxFeeFormat[chain]

  return match<EvmTxFeeFormat, TwFeeFields>(feeFormat, {
    enveloped: () => ({
      txMode: TW.Ethereum.Proto.TransactionMode.Enveloped,
      gasLimit: toEvmTwAmount(gasLimit),
      maxFeePerGas: toEvmTwAmount(maxFeePerGasWei),
      maxInclusionFeePerGas: toEvmTwAmount(priorityFee),
    }),
    legacy: () => ({
      txMode: TW.Ethereum.Proto.TransactionMode.Legacy,
      gasLimit: toEvmTwAmount(gasLimit),
      gasPrice: toEvmTwAmount(maxFeePerGasWei),
    }),
  })
}
