import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { callPopup } from '@core/inpage-provider/popup'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { ethers } from 'ethers'
import { type RpcTransactionRequest } from 'viem'

import { getChain } from '../utils'

export const sendEthTransaction = async ([tx]: [
  RpcTransactionRequest,
]): Promise<string> => {
  const chain = await getChain()

  const from = shouldBePresent(tx.from, 'tx.from')

  const { decimals, ticker } = chainFeeCoin[chain]

  const [{ hash }] = await callPopup(
    {
      sendTx: {
        keysign: {
          transactionDetails: {
            from,
            to: tx.to ?? undefined,
            asset: {
              ticker,
            },
            amount: tx.value
              ? {
                  amount: ethers.toBigInt(tx.value).toString(),
                  decimals,
                }
              : undefined,
            data: tx.data,
            gasSettings: {
              maxFeePerGas: tx.maxFeePerGas
                ? ethers.toBigInt(tx.maxFeePerGas).toString()
                : undefined,
              maxPriorityFeePerGas: tx.maxPriorityFeePerGas
                ? ethers.toBigInt(tx.maxPriorityFeePerGas).toString()
                : undefined,
              gasLimit: tx.gas ? ethers.toBigInt(tx.gas).toString() : undefined,
            },
          },
          chain,
        },
      },
    },
    {
      account: from,
    }
  )

  return hash
}
