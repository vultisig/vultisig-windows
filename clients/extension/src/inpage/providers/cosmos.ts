import { MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'
import { BaseCosmosChain } from './baseCosmos'
import { v4 as uuidv4 } from 'uuid'
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
  ): Promise<Messaging.Chain.Response> {
    try {
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

      if (callback) callback(null, response)
      return response
    } catch (error) {
      if (callback) callback(error as Error)
      throw error
    }
  }
}
