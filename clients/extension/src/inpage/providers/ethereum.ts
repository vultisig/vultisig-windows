import {
  EventMethod,
  MessageKey,
  RequestMethod,
} from '@clients/extension/src/utils/constants'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { getDappHost, isValidUrl } from '../../utils/connectedApps'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'

export class Ethereum extends EventEmitter {
  public chainId: string
  public connected: boolean
  public isCtrl: boolean
  public isMetaMask: boolean
  public isVultiConnect: boolean
  public isXDEFI: boolean
  public networkVersion: string
  public selectedAddress: string
  public sendAsync
  public static instance: Ethereum | null = null

  constructor() {
    super()
    this.chainId = '0x1'
    this.connected = false
    this.isCtrl = true
    this.isMetaMask = true
    this.isVultiConnect = true
    this.isXDEFI = true
    this.networkVersion = '1'
    this.selectedAddress = ''

    this.sendAsync = this.request

    if (isValidUrl(window.location.href)) {
      const host = getDappHost(window.location.href)
      messengers.popup?.reply(
        `${EventMethod.ACCOUNTS_CHANGED}:${host}`,
        async address => {
          this.selectedAddress = address as string
          this.emit(EventMethod.ACCOUNTS_CHANGED, [address])
        }
      )
      messengers.popup?.reply(
        `${EventMethod.CHAIN_CHANGED}:${host}`,
        async (chainId: number) => {
          this.emit(EventMethod.CHAIN_CHANGED, chainId)
        }
      )
      messengers.popup?.reply(`${EventMethod.DISCONNECT}:${host}`, async () => {
        this.connected = false
        this.emit(EventMethod.ACCOUNTS_CHANGED, [])
        this.emit(EventMethod.DISCONNECT, [])
      })
      messengers.popup?.reply(
        `${EventMethod.CONNECT}:${host}`,
        async connectionInfo => {
          this.connected = true
          this.emit(EventMethod.CONNECT, connectionInfo)
        }
      )
    }
  }

  static getInstance(_chain: string): Ethereum {
    if (!Ethereum.instance) {
      Ethereum.instance = new Ethereum()
    }
    if (!window.ctrlEthProviders) {
      window.ctrlEthProviders = {}
    }
    window.ctrlEthProviders['Ctrl Wallet'] = Ethereum.instance
    window.isCtrl = true
    return Ethereum.instance
  }

  async enable() {
    return await this.request({
      method: RequestMethod.METAMASK.ETH_REQUEST_ACCOUNTS,
      params: [],
    })
  }

  emitAccountsChanged(addresses: string[]) {
    if (addresses.length) {
      const [address] = addresses

      this.selectedAddress = address ?? ''
      this.emit(EventMethod.ACCOUNTS_CHANGED, address ? [address] : [])
    } else {
      this.selectedAddress = ''
      this.emit(EventMethod.ACCOUNTS_CHANGED, [])
    }
  }

  emitUpdateNetwork({ chainId }: { chainId: string }) {
    if (Number(chainId) && this.chainId !== chainId) this.chainId = chainId

    this.emit(EventMethod.NETWORK_CHANGED, Number(this.chainId))
    this.emit(EventMethod.CHAIN_CHANGED, this.chainId)
  }

  isConnected() {
    return this.connected
  }

  on = (event: string, callback: (data: any) => void): this => {
    if (event === EventMethod.CONNECT && this.isConnected()) {
      this.request({
        method: RequestMethod.METAMASK.ETH_CHAIN_ID,
        params: [],
      }).then(chainId => callback({ chainId }))
    } else {
      super.on(event, callback)
    }

    return this
  }

  async send(x: any, y: any) {
    if (typeof x === 'string') {
      return await this.request({ method: x, params: y ?? [] })
    } else if (typeof y === 'function') {
      this.request(x, y)
    } else {
      return await this.request(x)
    }
  }

  async request(data: Messaging.Chain.Request, callback?: Callback) {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: MessageKey.ETHEREUM_REQUEST,
          message: data,
        },
        { id: uuidv4() }
      )

      const result = processBackgroundResponse(
        data,
        MessageKey.ETHEREUM_REQUEST,
        response
      )

      switch (data.method) {
        case RequestMethod.METAMASK.WALLET_ADD_ETHEREUM_CHAIN:
        case RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN: {
          this.emitUpdateNetwork({ chainId: result as string })
          break
        }
        case RequestMethod.METAMASK.WALLET_REVOKE_PERMISSIONS: {
          this.emit(EventMethod.DISCONNECT, result)
          break
        }
      }

      if (callback) callback(null, result)

      return result
    } catch (error) {
      if (callback) callback(error as Error)
      throw error
    }
  }

  _connect = (): void => {
    this.emit(EventMethod.CONNECT, '')
  }

  _disconnect = (error?: { code: number; message: string }): void => {
    this.emit(
      EventMethod.DISCONNECT,
      error || { code: 4900, message: 'Provider disconnected' }
    )
  }
}
