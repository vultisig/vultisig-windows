import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'

import {
  ThorchainProviderMethod,
  ThorchainProviderRequest,
  ThorchainProviderResponse,
} from '../../types/thorchain'
import { EventMethod, MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { NetworkKey } from '../constants'
import { messengers } from '../messenger'

export class MAYAChain extends EventEmitter {
  public chainId: string
  public network: string
  public static instance: MAYAChain | null = null
  constructor() {
    super()
    this.chainId = 'Thorchain_mayachain'
    this.network = NetworkKey.MAINNET
  }

  static getInstance(): MAYAChain {
    if (!MAYAChain.instance) {
      MAYAChain.instance = new MAYAChain()
    }
    return MAYAChain.instance
  }

  changeNetwork(network: NetworkKey) {
    if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
      throw Error(`Invalid network ${network}`)
    else if (network === NetworkKey.TESTNET)
      throw Error(`We only support the ${NetworkKey.MAINNET} network.`)

    this.network = network
    this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network })
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }

  async request<T extends ThorchainProviderMethod>(
    data: ThorchainProviderRequest<T>,
    callback?: (
      error: Error | null,
      result?: ThorchainProviderResponse<T>
    ) => void
  ): Promise<ThorchainProviderResponse<T>> {
    try {
      const response = await messengers.background.send<
        any,
        ThorchainProviderResponse<T>
      >(
        'providerRequest',
        {
          type: MessageKey.MAYA_REQUEST,
          message: data,
        },
        { id: uuidv4() }
      )

      const result = processBackgroundResponse(
        data,
        MessageKey.MAYA_REQUEST,
        response
      )

      if (callback) callback(null, result)

      return result
    } catch (error) {
      if (callback) callback(error as Error)
      throw error
    }
  }
}
