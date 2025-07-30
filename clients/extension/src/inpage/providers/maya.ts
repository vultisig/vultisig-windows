import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Callback } from '../constants'
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

      const result = processBackgroundResponse(data, this.messageKey, response)

      if (callback) callback(null, result)
      return shouldBePresent(result)
    } catch (error) {
      if (callback) callback(error as Error)
      throw error
    }
  }
}
