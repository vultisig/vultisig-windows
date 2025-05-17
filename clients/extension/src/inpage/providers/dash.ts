import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Callback, Network } from '../constants'
import { messengers } from '../messenger'

export class Dash extends EventEmitter {
  public chainId: string
  public network: Network
  public static instance: Dash | null = null
  constructor() {
    super()
    this.chainId = 'Dash_dash'
    this.network = 'mainnet'
  }

  static getInstance(): Dash {
    if (!Dash.instance) {
      Dash.instance = new Dash()
    }
    return Dash.instance
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }

  async request(data: Messaging.Chain.Request, callback?: Callback) {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: MessageKey.DASH_REQUEST,
          message: data,
        },
        { id: uuidv4() }
      )

      const result = processBackgroundResponse(
        data,
        MessageKey.DASH_REQUEST,
        response
      )

      if (callback) callback(null, result)

      return result
    } catch (error) {
      if (callback) callback(error as Error)
      throw error
    }
  }
}
