import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import EventEmitter from 'events'

import { getSharedHandlers } from './core/sharedHandlers'

export class Sui extends EventEmitter {
  public static instance: Sui | null = null
  constructor() {
    super()
  }

  static getInstance(): Sui {
    if (!Sui.instance) {
      Sui.instance = new Sui()
    }
    return Sui.instance
  }

  async request(data: RequestInput) {
    const handlers = getSharedHandlers(OtherChain.Sui)

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers](data.params as any)
    }

    throw new NotImplementedError(`Sui method ${data.method}`)
  }
}
