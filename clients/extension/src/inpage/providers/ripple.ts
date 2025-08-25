import { OtherChain } from '@core/chain/Chain'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { messengers } from '../messenger'
import { getSharedHandlers } from './core/sharedHandlers'

export class Ripple extends EventEmitter {
  public static instance: Ripple | null = null
  constructor() {
    super()
  }

  static getInstance(): Ripple {
    if (!Ripple.instance) {
      Ripple.instance = new Ripple()
    }
    return Ripple.instance
  }

  async request(data: Messaging.Chain.Request) {
    const handlers = getSharedHandlers(OtherChain.Ripple)

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers]()
    }
    const response = await messengers.background.send<
      any,
      Messaging.Chain.Response
    >(
      'providerRequest',
      {
        type: MessageKey.RIPPLE_REQUEST,
        message: data,
      },
      { id: uuidv4() }
    )
    return processBackgroundResponse(data, MessageKey.RIPPLE_REQUEST, response)
  }
}
