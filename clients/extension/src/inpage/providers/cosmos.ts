import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { callBackground } from '@core/inpage-provider/background'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { Callback } from '../constants'
import { BaseCosmosChain } from './baseCosmos'
import { getSharedHandlers } from './core/sharedHandlers'

export class Cosmos extends BaseCosmosChain {
  public static instance: Cosmos | null = null

  private constructor() {
    super('Cosmos')
  }

  static getInstance(): Cosmos {
    if (!Cosmos.instance) {
      Cosmos.instance = new Cosmos()
    }
    return Cosmos.instance
  }

  async request(data: RequestInput, callback?: Callback): Promise<unknown> {
    const handleSwitchChain = async ([{ chainId }]: [{ chainId: string }]) => {
      const chain = getCosmosChainByChainId(chainId)
      if (!chain) {
        throw new EIP1193Error('UnrecognizedChain')
      }
    }
    const processRequest = async () => {
      const chain = await callBackground({
        getAppChain: { chainKind: 'cosmos' },
      })
      const handlers = {
        ...getSharedHandlers(chain),
        wallet_switch_chain: handleSwitchChain,
        wallet_add_chain: handleSwitchChain,
      }

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers](
          data.params as any
        )
      }

      throw new NotImplementedError(`Cosmos method ${data.method}`)
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
