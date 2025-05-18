import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Network } from '../constants'
import { Callback } from '../constants'
import { messengers } from '../messenger'

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

  async request(
    data: Messaging.Chain.Request,
    callback?: Callback
  ): Promise<Messaging.Chain.Response> {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: this.messageKey,
          message: data,
        },
        { id: uuidv4() }
      )

      const result = processBackgroundResponse(data, this.messageKey, response)

      if (callback) callback(null, result)
      return result
    } catch (error) {
      if (callback) callback(error as Error)
      throw error
    }
  }
}
