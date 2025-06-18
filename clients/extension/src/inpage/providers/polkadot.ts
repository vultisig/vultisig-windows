import { Network } from '@clients/extension/src/inpage/constants'
import { messengers } from '@clients/extension/src/inpage/messenger'
import { MessageKey } from '@clients/extension/src/utils/constants'
import { processBackgroundResponse } from '@clients/extension/src/utils/functions'
import { Messaging } from '@clients/extension/src/utils/interfaces'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

export class Polkadot extends EventEmitter {
  public network: Network
  public static instance: Polkadot | null = null
  constructor() {
    super()
    this.network = 'mainnet'
  }

  static getInstance(): Polkadot {
    if (!Polkadot.instance) {
      Polkadot.instance = new Polkadot()
    }
    return Polkadot.instance
  }

  async request(data: Messaging.Chain.Request) {
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
