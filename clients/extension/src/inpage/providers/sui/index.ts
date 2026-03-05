import { OtherChain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { attempt } from '@lib/utils/attempt'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import {
  type SuiSignAndExecuteTransactionMethod,
  type SuiSignPersonalMessageMethod,
  type SuiSignTransactionMethod,
} from '@mysten/wallet-standard'
import type { Wallet } from '@wallet-standard/base'
import {
  StandardConnect,
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
} from '@wallet-standard/features'

import { Callback } from '../../constants'
import icon from '../../icon'
import { requestAccount } from '../core/requestAccount'
import { getSharedHandlers } from '../core/sharedHandlers'
import { VultisigSuiWalletAccount } from './account'
import { isSuiChain, SuiChains } from './chains'

const frozenChains = Object.freeze([...SuiChains] as const)

export class Sui implements Wallet {
  public static instance: Sui | null = null
  private readonly listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][]
  } = {}
  readonly version = '1.0.0' as const
  readonly name = 'Vultisig'
  readonly icon = icon as `data:image/png;base64,${string}`
  private account: VultisigSuiWalletAccount | null = null
  readonly chains = frozenChains as Wallet['chains']

  private constructor() {
    this.#connected()
  }

  static getInstance(): Sui {
    if (!Sui.instance) {
      Sui.instance = new Sui()
    }
    return Sui.instance
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature & {
      'sui:signTransaction': {
        version: '2.0.0'
        signTransaction: SuiSignTransactionMethod
      }
      'sui:signAndExecuteTransaction': {
        version: '2.0.0'
        signAndExecuteTransaction: SuiSignAndExecuteTransactionMethod
      }
      'sui:signPersonalMessage': {
        version: '1.1.0'
        signPersonalMessage: SuiSignPersonalMessageMethod
      }
    } {
    return {
      [StandardConnect]: {
        version: '1.0.0',
        connect: this.#connect,
      },
      [StandardDisconnect]: {
        version: '1.0.0',
        disconnect: this.#disconnect,
      },
      [StandardEvents]: {
        version: '1.0.0',
        on: this.#on,
      },
      'sui:signTransaction': {
        version: '2.0.0',
        signTransaction: this.#signTransaction,
      },
      'sui:signAndExecuteTransaction': {
        version: '2.0.0',
        signAndExecuteTransaction: this.#signAndExecuteTransaction,
      },
      'sui:signPersonalMessage': {
        version: '1.1.0',
        signPersonalMessage: this.#signPersonalMessage,
      },
    }
  }

  get accounts() {
    return this.account ? [this.account] : []
  }

  #connected = async () => {
    const { data } = await attempt(
      callBackground({
        getAccount: { chain: OtherChain.Sui },
      })
    )

    if (data) {
      const { address, publicKey } = data

      const pubkeyBytes = Uint8Array.from(Buffer.from(publicKey, 'hex'))
      const currentAccount = this.account
      if (!currentAccount || currentAccount.address !== address) {
        this.account = new VultisigSuiWalletAccount({
          address,
          publicKey: pubkeyBytes,
          label: 'Vultisig Extension',
          icon: this.icon,
        })
        this.#emit('change', { accounts: this.accounts })
      }
    }
  }

  #connect: StandardConnectMethod = async () => {
    if (!this.account) {
      const { address, publicKey } = await requestAccount(OtherChain.Sui)
      const pubkeyBytes = Uint8Array.from(Buffer.from(publicKey, 'hex'))
      this.account = new VultisigSuiWalletAccount({
        address,
        publicKey: pubkeyBytes,
        label: 'Vultisig Extension',
        icon: this.icon,
      })

      this.#emit('change', { accounts: this.accounts })
    }

    return { accounts: this.accounts }
  }

  #disconnect = async () => {
    this.account = null
    await callBackground({ signOut: {} })
    this.#emit('change', { accounts: this.accounts })
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    if (this.listeners[event]) {
      this.listeners[event]!.push(listener)
    } else {
      this.listeners[event] = [listener]
    }
    return (): void => {
      this.listeners[event] = this.listeners[event]?.filter(
        existing => listener !== existing
      )
    }
  }

  #emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void {
    // eslint-disable-next-line prefer-spread
    this.listeners[event]?.forEach(listener => listener.apply(null, args))
  }

  #signTransaction: SuiSignTransactionMethod = async input => {
    if (!this.account) throw new Error('not connected')
    if (input.account !== this.account) throw new Error('invalid account')
    if (input.chain && !isSuiChain(input.chain))
      throw new Error('invalid chain')

    const transactionJson = await input.transaction.toJSON()

    const [{ data }] = await callPopup(
      {
        sendTx: {
          serialized: {
            data: [transactionJson],
            chain: OtherChain.Sui,
            skipBroadcast: true,
          },
        },
      },
      { account: this.account.address }
    )

    return {
      bytes: data.output as string,
      signature: data.signature as string,
    }
  }

  #signAndExecuteTransaction: SuiSignAndExecuteTransactionMethod =
    async input => {
      if (!this.account) throw new Error('not connected')
      if (input.account !== this.account) throw new Error('invalid account')
      if (input.chain && !isSuiChain(input.chain))
        throw new Error('invalid chain')

      const transactionJson = await input.transaction.toJSON()

      const [{ hash, data }] = await callPopup(
        {
          sendTx: {
            serialized: {
              data: [transactionJson],
              chain: OtherChain.Sui,
            },
          },
        },
        { account: this.account.address }
      )

      return {
        bytes: data.output as string,
        signature: data.signature as string,
        digest: hash,
        effects: '',
      }
    }

  #signPersonalMessage: SuiSignPersonalMessageMethod = async input => {
    if (!this.account) throw new Error('not connected')
    if (input.account !== this.account) throw new Error('invalid account')

    const message = new TextDecoder().decode(input.message)

    const signature = await callPopup(
      {
        signMessage: {
          sign_message: {
            chain: OtherChain.Sui,
            message,
          },
        },
      },
      { account: this.account.address }
    )

    return {
      bytes: Buffer.from(input.message).toString('base64'),
      signature: String(signature),
    }
  }

  async request(data: RequestInput, callback?: Callback) {
    const processRequest = async () => {
      const handlers = getSharedHandlers(OtherChain.Sui)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers](
          data.params as any
        )
      }

      throw new NotImplementedError(`Sui method ${data.method}`)
    }

    try {
      const result = await processRequest()
      callback?.(null, result)
      return result
    } catch (error) {
      callback?.(error as Error)
      throw error
    }
  }
}
