import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { messengers } from '../messenger'
import { BaseCosmosChain } from './baseCosmos'
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
    data: Messaging.Chain.Request
  ): Promise<Messaging.Chain.Response> {
    return messengers.background.send<any, Messaging.Chain.Response>(
      'providerRequest',
      {
        type: this.messageKey,
        message: data,
      },
      { id: uuidv4() }
    )
  }
}
