import { messengers } from '@clients/extension/src/inpage/messenger'
import { MessageKey } from '@clients/extension/src/utils/constants'
import { processBackgroundResponse } from '@clients/extension/src/utils/functions'
import { Messaging } from '@clients/extension/src/utils/interfaces'
import { OtherChain } from '@core/chain/Chain'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { getSharedHandlers } from './core/sharedHandlers'

export class Polkadot extends EventEmitter {
  public static instance: Polkadot | null = null
  constructor() {
    super()
  }

  static getInstance(): Polkadot {
    if (!Polkadot.instance) {
      Polkadot.instance = new Polkadot()
    }
    return Polkadot.instance
  }

  async request(data: Messaging.Chain.Request) {
    const handlers = getSharedHandlers(OtherChain.Polkadot)

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers]()
    }
    const response = await messengers.background.send<
      any,
      Messaging.Chain.Response
    >(
      'providerRequest',
      {
        type: MessageKey.POLKADOT_REQUEST,
        message: data,
      },
      { id: uuidv4() }
    )
    return processBackgroundResponse(
      data,
      MessageKey.POLKADOT_REQUEST,
      response
    )
  }
}
