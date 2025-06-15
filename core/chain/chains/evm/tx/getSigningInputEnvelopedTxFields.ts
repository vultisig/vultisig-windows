import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'

type Input = {
  maxFeePerGasWei: string
  priorityFee: string
  gasLimit: string
}

export type EnvelopedTxFeeFields = Pick<
  TW.Ethereum.Proto.SigningInput,
  'gasLimit' | 'maxFeePerGas' | 'maxInclusionFeePerGas' | 'txMode'
>

export const getSigningInputEnvelopedTxFields = ({
  maxFeePerGasWei,
  priorityFee,
  gasLimit,
}: Input): EnvelopedTxFeeFields => {
  return {
    txMode: TW.Ethereum.Proto.TransactionMode.Enveloped,
    gasLimit: Buffer.from(stripHexPrefix(bigIntToHex(BigInt(gasLimit))), 'hex'),
    maxFeePerGas: Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(maxFeePerGasWei))),
      'hex'
    ),
    maxInclusionFeePerGas: Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(priorityFee))),
      'hex'
    ),
  }
}
