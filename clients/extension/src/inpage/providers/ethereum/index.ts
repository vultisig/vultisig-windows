import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { toEip1193Error } from '@clients/extension/src/inpage/providers/ethereum/eip1193Translate'
import { EthereumProviderEvents } from '@clients/extension/src/inpage/providers/ethereum/events'
import {
  ethereumHandlers,
  processSignature,
} from '@clients/extension/src/inpage/providers/ethereum/handlers'
import { addBackgroundEventListener } from '@core/inpage-provider/background/events/inpage'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { validateUrl } from '@vultisig/lib-utils/validation/url'
import EventEmitter from 'events'

export { processSignature }

export class Ethereum extends EventEmitter<EthereumProviderEvents> {
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

    if (!validateUrl(window.location.href)) {
      addBackgroundEventListener('disconnect', () => {
        this.connected = false
        this.emit('accountsChanged', [])
        this.emit('disconnect', [])
      })

      addBackgroundEventListener('evmChainChanged', chainId => {
        this.chainId = chainId
        this.emit('networkChanged', Number(this.chainId))
        this.emit('chainChanged', this.chainId)
      })
    }
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

  async request(data: RequestInput) {
    if (data.method in ethereumHandlers) {
      try {
        return await ethereumHandlers[
          data.method as keyof typeof ethereumHandlers
        ](data.params as never)
      } catch (error) {
        // EIP-1193 §5.4 mandates `ProviderRpcError`-shaped rejections.
        // Resolvers that call `callPopup` reject with the raw
        // `PopupError.RejectedByUser` string when the user dismisses
        // the approval popup — translate here so dApps can rely on
        // `error.code === 4001`.
        throw toEip1193Error(error)
      }
    }

    throw new EIP1193Error('UnsupportedMethod')
  }
}
