import { UtxoChain } from '@core/chain/Chain'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'
import { getSharedHandlers } from './core/sharedHandlers'

export class Dash extends EventEmitter {
  public chainId: string
  public static instance: Dash | null = null
  constructor() {
    super()
    this.chainId = 'Dash_dash'
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
    const processRequest = async () => {
      const handlers = getSharedHandlers(UtxoChain.Dash)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers]()
      }
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

      return result
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
