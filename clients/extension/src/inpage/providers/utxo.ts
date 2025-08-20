import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey, RequestMethod } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging, ProviderId } from '../../utils/interfaces'
import { Callback, Network } from '../constants'
import { messengers } from '../messenger'

export class UTXO extends EventEmitter {
  public chainId: string
  public network: Network
  private providerType: MessageKey
  public static instances: Map<string, UTXO>
  private providerId: ProviderId
  constructor(providerType: string, chainId: string, providerId: ProviderId) {
    super()
    this.providerType = providerType as MessageKey
    this.chainId = chainId
    this.network = 'mainnet'
    this.providerId = providerId
  }

  static getInstance(
    providerType: string,
    chainId: string,
    providerId: ProviderId
  ): UTXO {
    if (!UTXO.instances) {
      UTXO.instances = new Map<string, UTXO>()
    }

    if (!UTXO.instances.has(providerType)) {
      UTXO.instances.set(
        providerType,
        new UTXO(providerType, chainId, providerId)
      )
    }
    return UTXO.instances.get(providerType)!
  }

  async requestAccounts() {
    const address = await this.request({
      method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
      params: [],
      context: { provider: this.providerId },
    })
    return address
  }

  async getAccounts() {
    return await this.request({
      method: RequestMethod.VULTISIG.GET_ACCOUNTS,
      params: [],
      context: { provider: this.providerId },
    })
  }

  async signPSBT(_psbt: string | Buffer) {
    return await this.request({
      method: RequestMethod.CTRL.SIGN_PSBT,
      params: [],
      context: { provider: this.providerId },
    })
  }

  changeNetwork(network: Network) {
    if (network !== 'mainnet' && network !== 'testnet')
      throw Error(`Invalid network ${network}`)
    else if (network === 'testnet')
      throw Error(`We only support the mainnet network.`)

    this.chainId = `Bitcoin_bitcoin-${network}`
    this.network = network
    this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network })
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }

  async request(data: Messaging.Chain.Request, callback?: Callback) {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: this.providerType,
          message: data,
        },
        { id: uuidv4() }
      )

      const result = processBackgroundResponse(
        data,
        this.providerType,
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
