import { CosmosChain } from '@core/chain/Chain'
import { callPopup } from '@core/inpage-provider/popup'
import {
  DepositTransactionDetails,
  RequestInput,
  TransactionDetails,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'

import { Callback } from '../constants'
import { BaseCosmosChain } from './baseCosmos'
import { getSharedHandlers } from './core/sharedHandlers'

export class THORChain extends BaseCosmosChain {
  public static instance: THORChain | null = null

  private constructor() {
    super('Thorchain_thorchain')
  }

  static getInstance(): THORChain {
    if (!THORChain.instance) {
      THORChain.instance = new THORChain()
    }
    return THORChain.instance
  }

  async request(data: RequestInput, callback?: Callback): Promise<unknown> {
    const processRequest = async () => {
      const handlers = {
        ...getSharedHandlers(CosmosChain.THORChain),
        deposit_transaction: async ([tx]: [TransactionDetails]) => {
          const { hash } = await callPopup(
            {
              sendTx: {
                keysign: {
                  transactionDetails: tx,
                  chain: CosmosChain.THORChain,
                  isDeposit: true,
                },
              },
            },
            {
              account: tx.from,
            }
          )

          return hash
        },
        deposit: async ([tx]: [DepositTransactionDetails]) => {
          const { hash } = await callPopup(
            {
              sendTx: {
                keysign: {
                  transactionDetails: {
                    ...tx,
                    to: tx.recipient,
                    data: tx.memo,
                  },
                  chain: CosmosChain.THORChain,
                  isDeposit: true,
                },
              },
            },
            {
              account: tx.from,
            }
          )

          return hash
        },
      }

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers](
          data.params as any
        )
      }

      throw new NotImplementedError(`THORChain method ${data.method}`)
    }

    try {
      const result = await processRequest()

      callback?.(null, result)

      return result
    } catch (error) {
      callback?.(error as Error)
      throw error
    }
  }
}
