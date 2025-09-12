import { OtherChain } from '@core/chain/Chain'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import EventEmitter from 'events'

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

  async request(data: RequestInput) {
    const handlers = getSharedHandlers(OtherChain.Polkadot)

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers](data.params as any)
    }

    throw new NotImplementedError(`Polkadot method ${data.method}`)
  }
}
