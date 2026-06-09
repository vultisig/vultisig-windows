import { callBackground } from '@core/inpage-provider/background'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { Chain } from '@vultisig/core-chain/Chain'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt } from '@vultisig/lib-utils/attempt'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
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

import { currentExtensionBrandConfig } from '../../brand/extensionBrandConfig'
import { bytesEqual } from '../../utils/functions'
import { Callback } from '../constants'
import icon from '../icon'
import { requestAccount } from './core/requestAccount'
import { getSharedHandlers } from './core/sharedHandlers'
import { VultisigSuiWalletAccount } from './sui/account'
import { SuiChains } from './sui/chains'
import {
  buildSuiTransactionBytes,
  executeSuiTransaction,
  signSuiPersonalMessage,
  signSuiTransaction,
} from './sui/sign'

const frozenChains = Object.freeze([...SuiChains] as const)

// Publish both legacy ("…Block") and modern Sui Wallet Standard feature names
// so older `@mysten/wallet-standard` consumers and newer `@mysten/dapp-kit`
// consumers both bind successfully.
const SuiSignMessage = 'sui:signMessage'
const SuiSignPersonalMessage = 'sui:signPersonalMessage'
const SuiSignTransactionBlock = 'sui:signTransactionBlock'
const SuiSignTransaction = 'sui:signTransaction'
const SuiSignAndExecuteTransactionBlock = 'sui:signAndExecuteTransactionBlock'
const SuiSignAndExecuteTransaction = 'sui:signAndExecuteTransaction'
const SuiReportTransactionEffects = 'sui:reportTransactionEffects'

// Sui Wallet Standard feature input shapes — kept loose (`unknown`) where we
// only forward the value to @mysten/sui SDK helpers that already validate it.
type SuiSignMessageInput = {
  message: Uint8Array
  account: { address: string }
}

type SuiSignPersonalMessageInput = SuiSignMessageInput

type SuiSignTransactionInput = {
  transaction: unknown
  account: { address: string }
}

type SuiSignTransactionBlockInput = {
  transactionBlock: unknown
  account: { address: string }
}

type SuiSignAndExecuteTransactionInput = SuiSignTransactionInput & {
  options?: {
    showEffects?: boolean
    showEvents?: boolean
    showObjectChanges?: boolean
    showBalanceChanges?: boolean
    showInput?: boolean
    showRawInput?: boolean
    showRawEffects?: boolean
  }
}

type SuiSignAndExecuteTransactionBlockInput = SuiSignTransactionBlockInput & {
  options?: SuiSignAndExecuteTransactionInput['options']
}

export class Sui implements Wallet {
  public static instance: Sui | null = null
  private readonly listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][]
  } = {}
  readonly version = '1.0.0' as const
  readonly name: string
  readonly icon = icon as `data:image/png;base64,${string}`
  private account: VultisigSuiWalletAccount | null = null
  public isPhantom: boolean
  readonly chains = frozenChains as Wallet['chains']

  static getInstance(): Sui {
    if (!Sui.instance) {
      Sui.instance = new Sui()
    }
    return Sui.instance
  }

  get isConnected() {
    return !!this.account
  }

  get accounts() {
    return this.account ? [this.account] : []
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature & {
      [SuiSignMessage]: {
        version: '1.0.0'
        signMessage: (
          input: SuiSignMessageInput
        ) => Promise<{ signature: string; messageBytes: string }>
      }
      [SuiSignPersonalMessage]: {
        version: '1.1.0'
        signPersonalMessage: (
          input: SuiSignPersonalMessageInput
        ) => Promise<{ signature: string; bytes: string }>
      }
      [SuiSignTransactionBlock]: {
        version: '1.0.0'
        signTransactionBlock: (
          input: SuiSignTransactionBlockInput
        ) => Promise<{ signature: string; transactionBlockBytes: string }>
      }
      [SuiSignTransaction]: {
        version: '2.0.0'
        signTransaction: (
          input: SuiSignTransactionInput
        ) => Promise<{ signature: string; bytes: string }>
      }
      [SuiSignAndExecuteTransactionBlock]: {
        version: '1.0.0'
        signAndExecuteTransactionBlock: (
          input: SuiSignAndExecuteTransactionBlockInput
        ) => Promise<unknown>
      }
      [SuiSignAndExecuteTransaction]: {
        version: '2.0.0'
        signAndExecuteTransaction: (
          input: SuiSignAndExecuteTransactionInput
        ) => Promise<{
          digest: string
          signature: string
          bytes: string
          effects: string
        }>
      }
      [SuiReportTransactionEffects]: {
        version: '1.0.0'
        reportTransactionEffects: (...args: unknown[]) => Promise<void>
      }
    } {
    return {
      [StandardConnect]: {
        version: '1.0.0',
        connect: this.#connect,
      },
      [StandardDisconnect]: {
        version: '1.0.0',
        disconnect: this.disconnect,
      },
      [StandardEvents]: {
        version: '1.0.0',
        on: this.on,
      },
      [SuiSignMessage]: {
        version: '1.0.0',
        signMessage: this.#signMessage,
      },
      [SuiSignPersonalMessage]: {
        version: '1.1.0',
        signPersonalMessage: this.#signPersonalMessage,
      },
      [SuiSignTransactionBlock]: {
        version: '1.0.0',
        signTransactionBlock: this.#signTransactionBlock,
      },
      [SuiSignTransaction]: {
        version: '2.0.0',
        signTransaction: this.#signTransaction,
      },
      [SuiSignAndExecuteTransactionBlock]: {
        version: '1.0.0',
        signAndExecuteTransactionBlock: this.#signAndExecuteTransactionBlock,
      },
      [SuiSignAndExecuteTransaction]: {
        version: '2.0.0',
        signAndExecuteTransaction: this.#signAndExecuteTransaction,
      },
      [SuiReportTransactionEffects]: {
        version: '1.0.0',
        reportTransactionEffects: async () => {
          // No-op: we don't track Sui effects on the wallet side yet.
        },
      },
    }
  }

  constructor() {
    this.name = currentExtensionBrandConfig.provider.walletPickerName
    this.isPhantom = true
    void this.#syncFromBackground({ emit: false })
  }

  #assertConnected(): VultisigSuiWalletAccount {
    if (!this.account) throw new Error('not connected')
    return this.account
  }

  #signPersonalMessage = async ({
    message,
    account,
  }: SuiSignPersonalMessageInput): Promise<{
    signature: string
    bytes: string
  }> => {
    const connected = this.#assertConnected()
    if (account.address !== connected.address) {
      throw new Error('invalid account')
    }
    return signSuiPersonalMessage({
      message,
      publicKey: connected.publicKey,
    })
  }

  #signMessage = async ({
    message,
    account,
  }: SuiSignMessageInput): Promise<{
    signature: string
    messageBytes: string
  }> => {
    const { signature, bytes } = await this.#signPersonalMessage({
      message,
      account,
    })
    return { signature, messageBytes: bytes }
  }

  #buildAndSign = async (
    transaction: unknown
  ): Promise<{ signature: string; bytes: string }> => {
    const connected = this.#assertConnected()
    const transactionBytesBase64 = await buildSuiTransactionBytes({
      sender: connected.address,
      transaction,
    })
    return signSuiTransaction({
      transactionBytesBase64,
      publicKey: connected.publicKey,
    })
  }

  #signTransaction = async ({
    transaction,
    account,
  }: SuiSignTransactionInput): Promise<{
    signature: string
    bytes: string
  }> => {
    const connected = this.#assertConnected()
    if (account.address !== connected.address) {
      throw new Error('invalid account')
    }
    return this.#buildAndSign(transaction)
  }

  #signTransactionBlock = async ({
    transactionBlock,
    account,
  }: SuiSignTransactionBlockInput): Promise<{
    signature: string
    transactionBlockBytes: string
  }> => {
    const connected = this.#assertConnected()
    if (account.address !== connected.address) {
      throw new Error('invalid account')
    }
    const { signature, bytes } = await this.#buildAndSign(transactionBlock)
    return { signature, transactionBlockBytes: bytes }
  }

  #signAndExecuteTransaction = async ({
    transaction,
    account,
  }: SuiSignAndExecuteTransactionInput) => {
    const connected = this.#assertConnected()
    if (account.address !== connected.address) {
      throw new Error('invalid account')
    }
    const { signature, bytes } = await this.#buildAndSign(transaction)
    const result = await executeSuiTransaction({
      transactionBytesBase64: bytes,
      signature,
    })

    // Fail fast if the execute response is missing a digest. Returning an
    // empty digest would make dApps treat a failed broadcast as a success.
    if (
      typeof result !== 'object' ||
      result === null ||
      !('digest' in result) ||
      typeof result.digest !== 'string' ||
      result.digest.length === 0
    ) {
      throw new Error('Sui transaction execution failed: missing digest')
    }

    const rawEffects =
      'rawEffects' in result && Array.isArray(result.rawEffects)
        ? result.rawEffects
        : undefined

    return {
      digest: result.digest,
      signature,
      bytes,
      // @mysten/dapp-kit consumers expect base64 raw effects.
      effects: rawEffects
        ? Buffer.from(new Uint8Array(rawEffects)).toString('base64')
        : '',
    }
  }

  #signAndExecuteTransactionBlock = async ({
    transactionBlock,
    account,
  }: SuiSignAndExecuteTransactionBlockInput) => {
    const connected = this.#assertConnected()
    if (account.address !== connected.address) {
      throw new Error('invalid account')
    }
    const { signature, bytes } = await this.#buildAndSign(transactionBlock)
    return executeSuiTransaction({
      transactionBytesBase64: bytes,
      signature,
    })
  }

  #setAccount(address: string, publicKeyHex: string) {
    const publicKeyBytes = Uint8Array.from(Buffer.from(publicKeyHex, 'hex'))

    const changed =
      !this.account ||
      this.account.address !== address ||
      !bytesEqual(this.account.publicKey, publicKeyBytes)

    if (changed) {
      this.account = new VultisigSuiWalletAccount({
        address,
        publicKey: publicKeyBytes,
        label: currentExtensionBrandConfig.manifest.name,
        icon: this.icon,
      })

      this.#emit('change', { accounts: [this.account] })
    }
  }

  #clearAccount(emit = true) {
    const hadAccount = !!this.account
    this.account = null
    if (emit && hadAccount) {
      this.#emit('change', { accounts: [] })
    }
  }

  #syncFromBackground = async ({ emit = true }: { emit?: boolean } = {}) => {
    const result = await attempt(
      callBackground({ getAccount: { chain: Chain.Sui } })
    )

    // Don't desync wallet state on transient transport failures — only treat
    // a successful response with no account as a real disconnect.
    if ('error' in result) {
      return
    }

    const { address, publicKey } = result.data

    if (!address || !publicKey) {
      this.#clearAccount(emit)
      return
    }

    const previousAddress = this.account?.address ?? null
    const publicKeyBytes = Uint8Array.from(Buffer.from(publicKey, 'hex'))
    const changed =
      !this.account ||
      this.account.address !== address ||
      !bytesEqual(this.account.publicKey, publicKeyBytes)

    if (changed) {
      this.account = new VultisigSuiWalletAccount({
        address,
        publicKey: publicKeyBytes,
        label: currentExtensionBrandConfig.manifest.name,
        icon: this.icon,
      })

      if (emit && previousAddress !== address) {
        this.#emit('change', { accounts: [this.account] })
      }
    }
  }

  #connect: StandardConnectMethod = async ({ silent } = {}) => {
    if (silent) {
      await this.#syncFromBackground({ emit: false })
      return { accounts: this.accounts }
    }

    if (this.account) {
      return { accounts: this.accounts }
    }

    const result = await requestAccount(Chain.Sui)
    const address = result?.address
    const publicKey = result?.publicKey

    if (!address || !publicKey) {
      throw new Error('User rejected connection or no Sui account returned')
    }

    this.#setAccount(address, publicKey)
    await this.#syncFromBackground({ emit: false })

    return { accounts: this.accounts }
  }

  public on: StandardEventsOnMethod = (event, listener) => {
    if (this.listeners[event]) {
      this.listeners[event]!.push(listener)
    } else {
      this.listeners[event] = [listener]
    }
    return (): void => this.off(event, listener)
  }

  #emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void {
    // eslint-disable-next-line prefer-spread
    this.listeners[event]?.forEach(listener => listener.apply(null, args))
  }

  public off<E extends StandardEventsNames>(
    event: E,
    listener: StandardEventsListeners[E]
  ): void {
    this.listeners[event] = this.listeners[event]?.filter(
      existing => listener !== existing
    )
  }

  connect = async () => {
    await this.#connect()
    return { address: shouldBePresent(this.account).address }
  }

  disconnect = async () => {
    await callBackground({ signOut: {} })
    this.#clearAccount(true)
  }

  request = async (data: RequestInput, callback?: Callback) => {
    const processRequest = async () => {
      const handlers = getSharedHandlers(Chain.Sui)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers](
          data.params as any
        )
      }

      throw new NotImplementedError(`Sui request method ${data.method}`)
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
