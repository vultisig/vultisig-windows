import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { messengers } from '../messenger'
import { BaseCosmosChain } from './baseCosmos'
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
