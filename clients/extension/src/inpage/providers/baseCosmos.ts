import { EventEmitter } from 'events'

import { EventMethod } from '../../utils/constants'

export abstract class BaseCosmosChain extends EventEmitter {
  public chainId: string
  public isVultiConnect = true

  constructor(chainId: string) {
    super()
    this.chainId = chainId
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }
}
