import { Chain, CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { decodeTxRaw } from '@cosmjs/proto-signing'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TxStatusResolver } from '../resolver'

/**
 * Chains where StargateClient cannot connect due to incompatible
 * validator pubkey types (e.g. MLDSA). Use REST API instead.
 */
const restOnlyChains: CosmosChain[] = [Chain.QBTC]

type RestTxResponse = {
  tx_response: {
    code: number
    gas_used: string
    gas_wanted: string
    tx: {
      auth_info: {
        fee: {
          amount: { amount: string }[]
        }
      }
    }
  }
}

type GetCosmosRestTxStatusInput = { chain: CosmosChain; hash: string }

/** Queries tx status via Cosmos REST API for chains incompatible with StargateClient. */
const getCosmosRestTxStatus = async ({
  chain,
  hash,
}: GetCosmosRestTxStatusInput): ReturnType<TxStatusResolver<CosmosChain>> => {
  const url = `${cosmosRpcUrl[chain]}/cosmos/tx/v1beta1/txs/${hash}`
  const { data: response, error } = await attempt(queryUrl<RestTxResponse>(url))

  if (error || !response) {
    return { status: 'pending' }
  }

  const { tx_response } = response
  const status = tx_response.code === 0 ? 'success' : 'error'
  const feeCoin = chainFeeCoin[chain]

  const receipt = (() => {
    const gasUsedRaw = tx_response.gas_used
    const gasWantedRaw = tx_response.gas_wanted
    const gasUsed = /^\d+$/.test(gasUsedRaw) ? BigInt(gasUsedRaw) : 0n
    const gasWanted = /^\d+$/.test(gasWantedRaw) ? BigInt(gasWantedRaw) : 0n
    if (gasWanted === 0n) {
      return undefined
    }
    const maxFeeRaw = tx_response.tx?.auth_info?.fee?.amount?.[0]?.amount
    const maxFeeAmount =
      maxFeeRaw != null && /^\d+$/.test(maxFeeRaw) ? BigInt(maxFeeRaw) : 0n
    const actualFee =
      maxFeeAmount > 0n ? (maxFeeAmount * gasUsed) / gasWanted : 0n
    if (actualFee === 0n) {
      return undefined
    }
    return {
      feeAmount: actualFee,
      feeDecimals: feeCoin.decimals,
      feeTicker: feeCoin.ticker,
    }
  })()

  return { status, receipt }
}

export const getCosmosTxStatus: TxStatusResolver<CosmosChain> = async ({
  chain,
  hash,
}) => {
  if (restOnlyChains.includes(chain)) {
    return getCosmosRestTxStatus({ chain, hash })
  }

  const client = await getCosmosClient(chain)

  const { data: tx, error } = await attempt(client.getTx(hash))

  if (error || !tx) {
    return { status: 'pending' }
  }

  const status = tx.code === 0 ? 'success' : 'error'
  const feeCoin = chainFeeCoin[chain]

  const receipt = (() => {
    const gasUsed = tx.gasUsed
    const gasWanted = tx.gasWanted
    if (gasUsed == null || gasWanted == null || gasWanted === 0n) {
      return undefined
    }
    const { data: decoded } = attempt(() => decodeTxRaw(tx.tx))
    if (!decoded) {
      return undefined
    }
    const fee = decoded.authInfo?.fee
    const maxFeeAmount =
      fee?.amount?.[0]?.amount != null ? BigInt(fee.amount[0].amount) : 0n
    const actualFee =
      maxFeeAmount > 0n ? (maxFeeAmount * gasUsed) / gasWanted : 0n
    if (actualFee === 0n) {
      return undefined
    }
    return {
      feeAmount: actualFee,
      feeDecimals: feeCoin.decimals,
      feeTicker: feeCoin.ticker,
    }
  })()

  return { status, receipt }
}
