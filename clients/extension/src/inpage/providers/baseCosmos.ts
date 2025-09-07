import { EventEmitter } from 'events'

export abstract class BaseCosmosChain extends EventEmitter {
  public chainId: string
  public isVultiConnect = true

  constructor(chainId: string) {
    super()
    this.chainId = chainId
  }
}
