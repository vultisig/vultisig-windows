import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Chain } from '@core/chain/Chain'
import { deserializeSigningOutput } from '@core/chain/tw/signingOutput'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { getTransactionAuthority } from '@core/inpage-provider/popup/view/resolvers/sendTx/core/solana/utils'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
  type SolanaSignAndSendTransactionMethod,
  type SolanaSignAndSendTransactionOutput,
  SolanaSignIn,
  type SolanaSignInFeature,
  SolanaSignInInput,
  type SolanaSignInMethod,
  type SolanaSignInOutput,
  SolanaSignMessage,
  type SolanaSignMessageFeature,
  type SolanaSignMessageMethod,
  type SolanaSignMessageOutput,
  SolanaSignTransaction,
  type SolanaSignTransactionFeature,
  type SolanaSignTransactionMethod,
  type SolanaSignTransactionOutput,
} from '@solana/wallet-standard-features'
import {
  PublicKey,
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js'
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

import { bytesEqual, isVersionedTransaction } from '../../utils/functions'
import { Callback } from '../constants'
import icon from '../icon'
import { requestAccount } from './core/requestAccount'
import { getSharedHandlers } from './core/sharedHandlers'
import { VultisigSolanaWalletAccount } from './solana/account'
import { isSolanaChain, SolanaChain, SolanaChains } from './solana/chains'
import { createSolanaSignInMessage } from './solana/signIn'

const frozenChains = Object.freeze([...SolanaChains] as const)
export class Solana implements Wallet {
  private _publicKey: PublicKey | null = null
  private _isConnected = false
  private readonly listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][]
  } = {}
  readonly version = '1.0.0' as const
  readonly name = 'Vultisig' as const
  readonly icon = icon as `data:image/png;base64,${string}`
  private account: VultisigSolanaWalletAccount | null = null
  public isPhantom: boolean
  public isXDEFI: boolean
  readonly chains = frozenChains as Wallet['chains']

  get isConnected() {
    return this._isConnected
  }

  get publicKey() {
    return this._publicKey
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature &
    SolanaSignInFeature {
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
      [SolanaSignAndSendTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signAndSendTransaction: this.#signAndSendTransaction,
      },
      [SolanaSignTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: this.#signTransaction,
      },
      [SolanaSignMessage]: {
        version: '1.0.0',
        signMessage: this.#signMessage,
      },
      [SolanaSignIn]: {
        version: '1.0.0',
        signIn: this.#signIn,
      },
    }
  }

  get accounts() {
    return this.account ? [this.account] : []
  }

  constructor() {
    this.isPhantom = true
    this.isXDEFI = true
    this.#connected()
  }

  #connected = async () => {
    const { data } = await attempt(
      callBackground({
        getAccount: { chain: Chain.Solana },
      })
    )

    if (data) {
      const { address } = data
      this._isConnected = true
      this._publicKey = new PublicKey(address)
      const pubkey = this._publicKey.toBytes()
      const account = this.account
      if (
        !account ||
        account.address !== address ||
        !bytesEqual(account.publicKey, pubkey)
      ) {
        this.account = new VultisigSolanaWalletAccount({
          address,
          publicKey: pubkey,
          label: 'Vultisig Extension',
          icon: this.icon,
        })

        this.#emit('change', { accounts: this.accounts })
      }
    }
  }

  #connect: StandardConnectMethod = async () => {
    if (!this.account) {
      await this.connect()
    }

    await this.#connected()

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
      existingListener => listener !== existingListener
    )
  }

  connect = async () => {
    const { address } = await requestAccount(Chain.Solana)
    this._publicKey = new PublicKey(shouldBePresent(address))
    this._isConnected = true
    return { publicKey: this.publicKey }
  }

  disconnect = async () => {
    this._publicKey = null
    await callBackground({
      signOut: {},
    })
    this._isConnected = false
    await Promise.resolve()
  }

  request = async (data: RequestInput, callback?: Callback) => {
    const processRequest = async () => {
      const handlers = getSharedHandlers(Chain.Solana)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers](
          data.params as any
        )
      }

      throw new NotImplementedError(`Solana request method ${data.method}`)
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

  signMessage = async (
    message: Uint8Array
  ): Promise<{ signature: Uint8Array }> => {
    if (!this.account) throw new Error('not connected')
    const messageBuffer = Buffer.from(message)
    const decodedString = new TextDecoder().decode(messageBuffer)

    const signature = await callPopup({
      signMessage: {
        sign_message: {
          message: decodedString,
          chain: Chain.Solana,
        },
      },
    })

    return {
      signature: Uint8Array.from(Buffer.from(String(signature), 'hex')),
    }
  }
  signIn = async (input: SolanaSignInInput): Promise<SolanaSignInOutput> => {
    await this.#connect()
    if (!this.account || !this.publicKey) {
      throw new Error('not connected')
    }
    const account = this.account
    if (input?.address && input.address !== account.address) {
      throw new Error('requested address does not match connected account')
    }
    const message = createSolanaSignInMessage({
      ...input,
      address: account.address,
    })

    const signature = await callPopup({
      signMessage: {
        sign_message: {
          message,
          chain: Chain.Solana,
        },
      },
    })

    return {
      account: account,
      signedMessage: Buffer.from(message),
      signature: Uint8Array.from(Buffer.from(String(signature), 'hex')),
      signatureType: 'ed25519',
    }
  }

  signTransaction = async (
    transaction: Transaction | VersionedTransaction,
    skipBroadcast: boolean = true
  ) => {
    let serializedTransaction: Uint8Array
    let authority: string | undefined

    if (isVersionedTransaction(transaction)) {
      serializedTransaction = transaction.serialize()
      authority = getTransactionAuthority(serializedTransaction)
    } else {
      serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      authority = transaction.feePayer?.toString()
    }

    const serializedBase64 = Buffer.from(serializedTransaction).toString(
      'base64'
    )

    const { data } = await callPopup(
      {
        sendTx: {
          serialized: {
            data: serializedBase64,
            skipBroadcast,
            chain: Chain.Solana,
          },
        },
      },
      {
        account: authority,
      }
    )

    const { encoded } = deserializeSigningOutput(Chain.Solana, data)
    if (!encoded) {
      throw new Error('No encoded transaction returned from signing')
    }

    const rawData = bs58.decode(encoded)

    if (isVersionedTransaction(transaction)) {
      return VersionedTransaction.deserialize(rawData)
    } else {
      return Transaction.from(Buffer.from(rawData))
    }
  }

  signAllTransactions = async <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) => {
    if (!transactions || !transactions.length) {
      return Promise.reject({
        code: -32000,
        message: 'Missing or invalid parameters.',
      })
    }

    const results: (Transaction | VersionedTransaction)[] = []

    for (const transaction of transactions) {
      const result = await this.signTransaction(transaction)
      if (result) {
        results.push(result)
      } else {
        throw new Error(
          'Failed to sign transaction: No matching instructions found'
        )
      }
    }

    return results
  }

  signAndSendTransaction = async <T extends Transaction | VersionedTransaction>(
    transaction: T,
    _options?: SendOptions
  ): Promise<{ signature: TransactionSignature }> => {
    const result = await this.signTransaction(transaction, false)
    if (!result) throw new Error('failed to signAndSendTransaction')

    const firstSignature = result.signatures[0]
    if (!firstSignature) {
      throw new Error('Transaction has no signatures')
    }

    return {
      signature: bs58.encode(firstSignature as any),
    }
  }

  #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    if (!this.account) throw new Error('not connected')

    const outputs: SolanaSignTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain } = inputs[0]!
      if (account !== this.account) throw new Error('invalid account')
      if (chain && !isSolanaChain(chain)) throw new Error('invalid chain')

      const signedTransaction = await this.signTransaction(
        VersionedTransaction.deserialize(transaction)
      )

      const serializedTransaction = shouldBePresent(
        signedTransaction?.serialize()
      )

      outputs.push({ signedTransaction: serializedTransaction })
    } else if (inputs.length > 1) {
      let chain: SolanaChain | undefined = undefined
      for (const input of inputs) {
        if (input.account !== this.account) throw new Error('invalid account')
        if (input.chain) {
          if (!isSolanaChain(input.chain)) throw new Error('invalid chain')
          if (chain) {
            if (input.chain !== chain) throw new Error('conflicting chain')
          } else {
            chain = input.chain
          }
        }
      }

      const transactions = inputs.map(({ transaction }) =>
        VersionedTransaction.deserialize(transaction)
      )

      const signedTransactions = await this.signAllTransactions(transactions)

      outputs.push(
        ...signedTransactions.map(signedTransaction => {
          const serializedTransaction = isVersionedTransaction(
            signedTransaction
          )
            ? signedTransaction.serialize()
            : new Uint8Array(
                (signedTransaction as Transaction).serialize({
                  requireAllSignatures: false,
                  verifySignatures: false,
                })
              )

          return { signedTransaction: serializedTransaction }
        })
      )
    }

    return outputs
  }

  #signMessage: SolanaSignMessageMethod = async (...inputs) => {
    if (!this.account) throw new Error('not connected')

    const outputs: SolanaSignMessageOutput[] = []
    if (inputs.length === 1) {
      const { message, account } = inputs[0]
      if (account !== this.account) throw new Error('invalid account')
      const { signature } = await this.signMessage(message)
      outputs.push({
        signedMessage: message,
        signature,
      })
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(...(await this.#signMessage(input)))
      }
    }
    return outputs
  }

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (
    ...inputs
  ) => {
    if (!this.account) throw new Error('not connected')

    const outputs: SolanaSignAndSendTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain, options } = inputs[0]!
      const { minContextSlot, preflightCommitment, skipPreflight, maxRetries } =
        options || {}
      if (account !== this.account) throw new Error('invalid account')
      if (!isSolanaChain(chain)) throw new Error('invalid chain')

      const { signature } = await this.signAndSendTransaction(
        VersionedTransaction.deserialize(transaction),
        {
          preflightCommitment,
          minContextSlot,
          maxRetries,
          skipPreflight,
        }
      )

      outputs.push({ signature: bs58.decode(signature) })
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(...(await this.#signAndSendTransaction(input)))
      }
    }

    return outputs
  }

  #signIn: SolanaSignInMethod = async (...inputs) => {
    const outputs: SolanaSignInOutput[] = []

    if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(await this.signIn(input))
      }
    } else {
      return [await this.signIn(inputs[0])]
    }
    return outputs
  }

  async handleNotification() {
    return Promise.reject({
      code: -32603,
      message: 'This function is not supported by Vultisig',
    })
  }
}
