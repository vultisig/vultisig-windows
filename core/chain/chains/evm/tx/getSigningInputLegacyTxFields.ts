import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'

type Input = {
  gasPrice: bigint
  gasLimit: bigint
}

export type LegacyTxFeeFields = Pick<
  TW.Ethereum.Proto.SigningInput,
  'gasLimit' | 'gasPrice' | 'txMode'
>

export const getSigningInputLegacyTxFields = ({
  gasPrice,
  gasLimit,
}: Input): LegacyTxFeeFields => {
  return {
    txMode: TW.Ethereum.Proto.TransactionMode.Legacy,
    gasLimit: Buffer.from(stripHexPrefix(bigIntToHex(BigInt(gasLimit))), 'hex'),
    gasPrice: Buffer.from(stripHexPrefix(bigIntToHex(gasPrice)), 'hex'),
  }
}
