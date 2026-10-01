import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { EthereumProviderEvents } from '@clients/extension/src/inpage/providers/ethereum/events'
import {
  ethereumHandlers,
  processSignature,
} from '@clients/extension/src/inpage/providers/ethereum/handlers'
import { addBackgroundEventListener } from '@core/inpage-provider/background/events/inpage'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { attempt } from '@vultisig/lib-utils/attempt'
import { validateUrl } from '@vultisig/lib-utils/validation/url'
import EventEmitter from 'events'

import { toEip1193Error } from './eip1193Translate'

export { processSignature }

/** Methods after which the background's EVM chain for this site may differ. */
const chainSyncMethods = [
  'eth_requestAccounts',
  'wallet_requestPermissions',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
] as const

/**
 * EIP-1193 provider injected into dApp pages. `chainId` and `networkVersion`
 * mirror the chain the background resolves for this site and are kept in
 * sync on load, after chain-affecting requests and on background events.
 */
export class Ethereum extends EventEmitter<EthereumProviderEvents> {
  public chainId: string
  public connected: boolean
  public isCtrl: boolean
  public isMetaMask: boolean
  public isTronLink: boolean
  public isVultiConnect: boolean
  public isXDEFI: boolean
  public networkVersion: string
  public selectedAddress: string
  public sendAsync
  public static instance: Ethereum | null = null
  private chainIdSyncId = 0

  constructor() {
    super()
    this.chainId = '0x1'
    this.connected = false
    this.isCtrl = true
    this.isMetaMask = true
    // The real TronLink extension serves Ethereum + BNB Smart Chain through
    // plain `window.ethereum` tagged with `isTronLink`. dApps that detect
    // TronLink read this flag and then route their `eth_*` / `wallet_*`
    // requests to `window.ethereum`, so exposing it lets Vultisig serve the
    // EVM half of TronLink-aware multichain flows.
    this.isTronLink = true
    this.isVultiConnect = true
    this.isXDEFI = true
    this.networkVersion = '1'
    this.selectedAddress = ''

    this.sendAsync = this.request

    if (!validateUrl(window.location.href)) {
      addBackgroundEventListener('disconnect', () => {
        this.connected = false
        this.emit('accountsChanged', [])
        this.emit('disconnect', [])
      })

      addBackgroundEventListener('accountsChanged', async () => {
        this.emit('accountsChanged', await ethereumHandlers.eth_accounts())
      })

      addBackgroundEventListener('evmChainChanged', chainId => {
        this.chainIdSyncId++
        this.setChainId(chainId)
      })

      void attempt(this.syncChainId)
    }
  }

  private setChainId(chainId: string) {
    if (chainId === this.chainId) return

    this.chainId = chainId
    this.networkVersion = Number(chainId).toString()
    this.emit('networkChanged', Number(chainId))
    this.emit('chainChanged', chainId)
  }

  private syncChainId = async () => {
    const syncId = ++this.chainIdSyncId
    const chainId = await ethereumHandlers.eth_chainId()

    if (syncId === this.chainIdSyncId) {
      this.setChainId(chainId)
    }

    return chainId
  }

  static getInstance(): Ethereum {
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

  isConnected() {
    return this.connected
  }

  enable = () => {
    return this.request({ method: 'eth_requestAccounts', params: [] })
  }

  request = async (data: RequestInput) => {
    if (data.method in ethereumHandlers) {
      try {
        if (data.method === 'eth_chainId') {
          return await this.syncChainId()
        }

        const result = await ethereumHandlers[
          data.method as keyof typeof ethereumHandlers
        ](data.params as never)

        if (isOneOf(data.method, chainSyncMethods)) {
          await attempt(this.syncChainId)
        }

        return result
      } catch (error) {
        throw toEip1193Error(error)
      }
    }

    throw new EIP1193Error('UnsupportedMethod')
  }
}
