import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { callBackground } from '@core/inpage-provider/background'
import { v4 as uuidv4 } from 'uuid'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { MessageKey } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'
import { BaseCosmosChain } from './baseCosmos'
import { getSharedHandlers } from './core/sharedHandlers'
export class Cosmos extends BaseCosmosChain {
  public static instance: Cosmos | null = null
  public messageKey = MessageKey.COSMOS_REQUEST

  private constructor() {
    super('Cosmos')
  }

  static getInstance(): Cosmos {
    if (!Cosmos.instance) {
      Cosmos.instance = new Cosmos()
    }
    return Cosmos.instance
  }

  async request(
    data: Messaging.Chain.Request,
    callback?: Callback
  ): Promise<Messaging.Chain.Response | void> {
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
      return messengers.background.send<any, Messaging.Chain.Response>(
        'providerRequest',
        {
          type: this.messageKey,
          message: data,
        },
        { id: uuidv4() }
      )
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
