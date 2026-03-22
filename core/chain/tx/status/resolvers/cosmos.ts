import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { sumFeeAmountForCosmosChainFeeDenom } from '@core/chain/chains/cosmos/sumFeeAmountForCosmosChainFeeDenom'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { decodeTxRaw } from '@cosmjs/proto-signing'
import { attempt } from '@lib/utils/attempt'

import { TxStatusResolver } from '../resolver'

export const getCosmosTxStatus: TxStatusResolver<CosmosChain> = async ({
  chain,
  hash,
}) => {
  const client = await getCosmosClient(chain)

  const { data: tx, error } = await attempt(client.getTx(hash))

  if (error || !tx) {
    return { status: 'pending' }
  }

  const status = tx.code === 0 ? 'success' : 'error'
  const feeCoin = chainFeeCoin[chain]

  const { data: receipt } = attempt(() => {
    const gasUsed = tx.gasUsed
    if (gasUsed == null || gasUsed === 0n) {
      return undefined
    }

    const { data: decoded, error: decodeError } = attempt(() =>
      decodeTxRaw(tx.tx)
    )
    if (decodeError || !decoded) {
      return undefined
    }

    const fee = decoded.authInfo?.fee
    const matchedNativeFee = sumFeeAmountForCosmosChainFeeDenom(
      fee?.amount,
      chain
    )
    if (matchedNativeFee == null) {
      return undefined
    }
    const maxFeeAmount = matchedNativeFee

    const gasWanted = tx.gasWanted
    const feeGasLimit = fee?.gasLimit ?? 0n

    const gasDenominator =
      gasWanted != null && gasWanted > 0n
        ? gasWanted
        : feeGasLimit > 0n
          ? feeGasLimit
          : gasUsed

    if (gasDenominator === 0n) {
      return undefined
    }

    let actualFee =
      maxFeeAmount > 0n ? (maxFeeAmount * gasUsed) / gasDenominator : 0n
    if (actualFee > maxFeeAmount) {
      actualFee = maxFeeAmount
    }
    if (actualFee === 0n) {
      return undefined
    }
    return {
      feeAmount: actualFee,
      feeDecimals: feeCoin.decimals,
      feeTicker: feeCoin.ticker,
    }
  })

  return { status, receipt }
}
