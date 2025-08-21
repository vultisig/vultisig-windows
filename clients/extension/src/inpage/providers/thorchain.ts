import { CosmosChain } from '@core/chain/Chain'
import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'
import { BaseCosmosChain } from './baseCosmos'
import { getSharedHandlers } from './core/sharedHandlers'
export class THORChain extends BaseCosmosChain {
  public static instance: THORChain | null = null
  public messageKey = MessageKey.THOR_REQUEST

  private constructor() {
    super('Thorchain_thorchain')
  }

  static getInstance(): THORChain {
    if (!THORChain.instance) {
      THORChain.instance = new THORChain()
    }
    return THORChain.instance
  }

  async request(
    data: Messaging.Chain.Request,
    callback?: Callback
  ): Promise<Messaging.Chain.Response> {
    const processRequest = async () => {
      const handlers = getSharedHandlers(CosmosChain.THORChain)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers]()
      }

      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: this.messageKey,
          message: data,
        },
        { id: uuidv4() }
      )

      return processBackgroundResponse(data, this.messageKey, response)
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
