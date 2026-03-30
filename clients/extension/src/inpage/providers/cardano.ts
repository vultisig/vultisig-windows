import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import EventEmitter from 'events'

import { getSharedHandlers } from './core/sharedHandlers'

export class Cardano extends EventEmitter {
  public static instance: Cardano | null = null
  constructor() {
    super()
  }

  static getInstance(): Cardano {
    if (!Cardano.instance) {
      Cardano.instance = new Cardano()
    }
    return Cardano.instance
  }

  async request(data: RequestInput) {
    const handlers = getSharedHandlers(OtherChain.Cardano)

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers](data.params as any)
    }

    throw new NotImplementedError(`Cardano method ${data.method}`)
  }
}
