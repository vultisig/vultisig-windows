import { OtherChain } from '@core/chain/Chain'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import EventEmitter from 'events'

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

  async request(data: RequestInput) {
    const handlers = getSharedHandlers(OtherChain.Ripple)

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers](data.params as any)
    }

    throw new NotImplementedError(`Ripple method ${data.method}`)
  }
}
