import { CosmosChain } from '@core/chain/Chain'
import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'
import { BaseCosmosChain } from './baseCosmos'
import { getSharedHandlers } from './core/sharedHandlers'
export class MAYAChain extends BaseCosmosChain {
  public static instance: MAYAChain | null = null
  public messageKey = MessageKey.MAYA_REQUEST

  private constructor() {
    super('Thorchain_mayachain')
  }

  static getInstance(): MAYAChain {
    if (!MAYAChain.instance) {
      MAYAChain.instance = new MAYAChain()
    }
    return MAYAChain.instance
  }

  async request(
    data: Messaging.Chain.Request,
    callback?: Callback
  ): Promise<Messaging.Chain.Response> {
    const processRequest = async () => {
      const handlers = getSharedHandlers(CosmosChain.MayaChain)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers]()
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
