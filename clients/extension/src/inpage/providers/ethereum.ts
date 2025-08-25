import { EventMethod, MessageKey } from '@clients/extension/src/utils/constants'
import { EvmChain } from '@core/chain/Chain'
import {
  getEvmChainByChainId,
  getEvmChainId,
} from '@core/chain/chains/evm/chainInfo'
import { callBackground } from '@core/inpage-provider/background'
import { attempt, withFallback } from '@lib/utils/attempt'
import { getUrlHost } from '@lib/utils/url/host'
import { validateUrl } from '@lib/utils/validation/url'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'
import { BlockTag } from 'viem'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { messengers } from '../messenger'
import { requestAccount } from './core/requestAccount'

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

    if (!validateUrl(window.location.href)) {
      const host = getUrlHost(window.location.href)
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
      callBackground({ getAppChainId: { chainKind: 'evm' } }).then(chainId => {
        callback({ chainId })
      })
    } else {
      super.on(event, callback)
    }
    return this
  }

  async request(data: Messaging.Chain.Request) {
    const getChain = async () => {
      const chain = await callBackground({
        getAppChain: { chainKind: 'evm' },
      })
      return chain as EvmChain
    }

    const switchChainHandler = async ([{ chainId }]: [{ chainId: string }]) => {
      const chain = getEvmChainByChainId(chainId)
      if (!chain) {
        throw new EIP1193Error('UnrecognizedChain')
      }

      await callBackground({
        setAppChain: { evm: chain },
      })

      this.emitUpdateNetwork({ chainId })

      return null
    }
    const handlers = {
      eth_chainId: async () =>
        callBackground({
          getAppChainId: { chainKind: 'evm' },
        }),
      eth_accounts: async () =>
        withFallback(
          attempt(async () => {
            const chain = await getChain()

            const { address } = await callBackground({
              getAccount: { chain },
            })

            return [address]
          }),
          []
        ),
      eth_requestAccounts: async () => {
        const chain = await getChain()

        const { address } = await requestAccount(chain)

        return [address]
      },
      wallet_switchEthereumChain: switchChainHandler,
      wallet_addEthereumChain: switchChainHandler,
      wallet_getPermissions: async () => [],
      wallet_requestPermissions: async () => [],
      wallet_revokePermissions: async () => {
        await callBackground({
          signOut: {},
        })
        this.emit(EventMethod.DISCONNECT)
      },
      net_version: async () => {
        const chain = await getChain()

        return parseInt(getEvmChainId(chain), 16).toString()
      },
      eth_getCode: async ([address, at]: [
        `0x${string}`,
        BlockTag | `0x${string}` | undefined,
      ]) =>
        callBackground({
          evmClientRequest: {
            method: 'eth_getCode',
            params: [address, at ?? 'latest'],
          },
        }),
      eth_getTransactionCount: async ([address, at]: [
        `0x${string}`,
        BlockTag | `0x${string}` | undefined,
      ]) =>
        callBackground({
          evmClientRequest: {
            method: 'eth_getTransactionCount',
            params: [address, at ?? 'latest'],
          },
        }),
      eth_getBalance: async ([address, at]: [
        `0x${string}`,
        BlockTag | `0x${string}` | undefined,
      ]) =>
        callBackground({
          evmClientRequest: {
            method: 'eth_getBalance',
            params: [address, at ?? 'latest'],
          },
        }),
      eth_blockNumber: async () =>
        callBackground({
          evmClientRequest: { method: 'eth_blockNumber' },
        }),
      eth_getBlockByNumber: async (params: unknown[]) =>
        callBackground({
          evmClientRequest: {
            method: 'eth_getBlockByNumber',
            params,
          },
        }),
      eth_gasPrice: async () =>
        callBackground({
          evmClientRequest: { method: 'eth_gasPrice' },
        }),
      eth_maxPriorityFeePerGas: async () =>
        callBackground({
          evmClientRequest: { method: 'eth_maxPriorityFeePerGas' },
        }),
      eth_estimateGas: async (params: unknown[]) =>
        callBackground({
          evmClientRequest: { method: 'eth_estimateGas', params },
        }),
      eth_call: async (params: unknown[]) =>
        callBackground({
          evmClientRequest: { method: 'eth_call', params },
        }),
      eth_getTransactionReceipt: async (params: unknown[]) =>
        callBackground({
          evmClientRequest: {
            method: 'eth_getTransactionReceipt',
            params,
          },
        }),
      eth_getTransactionByHash: async (params: unknown[]) =>
        callBackground({
          evmClientRequest: {
            method: 'eth_getTransactionByHash',
            params,
          },
        }),
    } as const

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers](data.params as any)
    }

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

    return processBackgroundResponse(
      data,
      MessageKey.ETHEREUM_REQUEST,
      response
    )
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
