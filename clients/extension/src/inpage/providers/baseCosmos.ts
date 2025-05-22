import { EventEmitter } from 'events'


import { EventMethod, MessageKey } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { Network } from '../constants'
import { Callback } from '../constants'
import { messengers } from '../messenger'
import { processBackgroundResponse } from '../../utils/functions'

export abstract class BaseCosmosChain extends EventEmitter {
  public chainId: string
  public network: Network = 'mainnet'
  public abstract messageKey: MessageKey
  public isVultiConnect = true

  constructor(chainId: string) {
    super()
    this.chainId = chainId
  }

  changeNetwork(network: Network) {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error(`Invalid network ${network}`)
    } else if (network === 'testnet') {
      throw new Error(`We only support the mainnet network.`)
    }

    this.network = network
    this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network })
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }

}
