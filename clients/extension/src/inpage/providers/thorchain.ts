import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'
import { BaseCosmosChain } from './baseCosmos'
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
