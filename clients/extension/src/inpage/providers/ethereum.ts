import { EventMethod } from '@clients/extension/src/utils/constants'
import { EvmChain } from '@core/chain/Chain'
import {
  getEvmChainByChainId,
  getEvmChainId,
} from '@core/chain/chains/evm/chainInfo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { callBackground } from '@core/inpage-provider/background'
import { addBackgroundEventListener } from '@core/inpage-provider/background/events/inpage'
import { callPopup } from '@core/inpage-provider/popup'
import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { validateUrl } from '@lib/utils/validation/url'
import { ethers, getBytes, isHexString, Signature } from 'ethers'
import EventEmitter from 'events'
import { BlockTag, type RpcTransactionRequest } from 'viem'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { requestAccount } from './core/requestAccount'

const processSignature = (signature: string) => {
  let result = Signature.from(ensureHexPrefix(signature))
  if (result.v < 27) {
    result = Signature.from({
      r: result.r,
      s: result.s,
      v: result.v + 27,
    })
  }

  return ensureHexPrefix(result.serialized)
}

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
      addBackgroundEventListener('disconnect', () => {
        this.connected = false
        this.emit(EventMethod.ACCOUNTS_CHANGED, [])
        this.emit(EventMethod.DISCONNECT, [])
      })
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

  async request(data: RequestInput) {
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
      eth_getBlockByNumber: async (
        params: [BlockTag | `0x${string}`, boolean]
      ) =>
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
      eth_estimateGas: async (
        params: [RpcTransactionRequest, BlockTag | `0x${string}` | undefined]
      ) =>
        callBackground({
          evmClientRequest: { method: 'eth_estimateGas', params },
        }),
      eth_call: async (
        params: [RpcTransactionRequest, BlockTag | `0x${string}` | undefined]
      ) =>
        callBackground({
          evmClientRequest: { method: 'eth_call', params },
        }),
      eth_getTransactionReceipt: async (
        params: [`0x${string}`] | [`0x${string}`, ...unknown[]]
      ) =>
        callBackground({
          evmClientRequest: {
            method: 'eth_getTransactionReceipt',
            params,
          },
        }),
      eth_getTransactionByHash: async (params: [`0x${string}`]) =>
        callBackground({
          evmClientRequest: {
            method: 'eth_getTransactionByHash',
            params,
          },
        }),
      eth_signTypedData_v4: async ([account, input]: [
        string,
        string | Eip712V4Payload,
      ]) => {
        const chain = await getChain()

        const result = await callPopup(
          {
            signMessage: {
              eth_signTypedData_v4: {
                chain,
                message:
                  typeof input === 'string'
                    ? (JSON.parse(input) as Eip712V4Payload)
                    : input,
              },
            },
          },
          {
            account,
          }
        )

        return processSignature(result)
      },
      personal_sign: async ([rawMessage, account]: [string, string]) => {
        const chain = await getChain()

        const message = isHexString(rawMessage)
          ? getBytes(rawMessage)
          : new TextEncoder().encode(rawMessage)

        const result = await callPopup(
          {
            signMessage: {
              personal_sign: {
                chain,
                message: new TextDecoder().decode(message),
                bytesCount: message.length,
              },
            },
          },
          {
            account,
          }
        )

        return processSignature(result)
      },
      eth_sendTransaction: async ([tx]: [RpcTransactionRequest]) => {
        const chain = await getChain()

        const from = shouldBePresent(tx.from, 'tx.from')

        const { decimals, ticker } = chainFeeCoin[chain]

        const { hash } = await callPopup(
          {
            sendTx: {
              keysign: {
                transactionDetails: {
                  from,
                  to: tx.to ?? undefined,
                  asset: {
                    chain: chain,
                    ticker,
                  },
                  amount: tx.value
                    ? {
                        amount: ethers.toBigInt(tx.value).toString(),
                        decimals,
                      }
                    : undefined,
                  data: tx.data,
                  gasSettings: {
                    maxFeePerGas: tx.maxFeePerGas
                      ? ethers.toBigInt(tx.maxFeePerGas).toString()
                      : undefined,
                    maxPriorityFeePerGas: tx.maxPriorityFeePerGas
                      ? ethers.toBigInt(tx.maxPriorityFeePerGas).toString()
                      : undefined,
                    gasLimit: tx.gas
                      ? ethers.toBigInt(tx.gas).toString()
                      : undefined,
                  },
                },
                chain,
              },
            },
          },
          {
            account: from,
          }
        )

        return hash
      },
    } as const

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers](data.params as any)
    }

    throw new NotImplementedError(`Ethereum method ${data.method}`)
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
