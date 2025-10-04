import { UtxoChain } from '@core/chain/Chain'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import EventEmitter from 'events'

import { Callback } from '../constants'
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

  async request(data: RequestInput, callback?: Callback) {
    const processRequest = async () => {
      const handlers = getSharedHandlers(UtxoChain.Dash)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers](
          data.params as any
        )
      }

      throw new NotImplementedError(`Dash method ${data.method}`)
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
