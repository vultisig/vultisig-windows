import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { callPopup } from '@core/inpage-provider/popup'
import { getEvmChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { ethers } from 'ethers'
import { type RpcTransactionRequest } from 'viem'

import { getChain } from '../utils'

export const sendEthTransaction = async ([tx]: [
  RpcTransactionRequest & { chainId?: `0x${string}` },
]): Promise<string> => {
  const from = shouldBePresent(tx.from, 'tx.from')
  const chain = await getChain(from)

  if (
    tx.chainId !== undefined &&
    BigInt(tx.chainId) !== BigInt(getEvmChainId(chain))
  ) {
    throw new EIP1193Error('InvalidParams')
  }

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
