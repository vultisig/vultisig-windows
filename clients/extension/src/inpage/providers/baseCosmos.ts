import { EventEmitter } from 'events'

import { EventMethod, MessageKey } from '../../utils/constants'

export abstract class BaseCosmosChain extends EventEmitter {
  public chainId: string
  public abstract messageKey: MessageKey
  public isVultiConnect = true

  constructor(chainId: string) {
    super()
    this.chainId = chainId
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }
}
