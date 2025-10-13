import { ITransactionPayload } from '../interfaces'

export const getThirdPartyGasLimitEstimation = (
  transactionPayload: ITransactionPayload
): bigint | undefined => {
  if ('keysign' in transactionPayload) {
    const { gasSettings } = transactionPayload.keysign.transactionDetails

    if (!gasSettings) {
      return
    }

    const { gasLimit } = gasSettings
    if (!gasLimit) {
      return
    }

    return BigInt(gasLimit)
  }
}
