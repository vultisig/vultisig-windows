import { Chain, OtherChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
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
  StandardConnect,
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
} from '@wallet-standard/features'

import {
  Connection,
  PublicKey,
  SystemInstruction,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey, RequestMethod } from '../../utils/constants'
import {
  bytesEqual,
  isVersionedTransaction,
  processBackgroundResponse,
} from '../../utils/functions'
import {
  ITransaction,
  Messaging,
  TransactionType,
} from '../../utils/interfaces'
import { Callback, Network } from '../constants'
import { messengers } from '../messenger'
import { VultisigSolanaWalletAccount } from './solana/account'
import { isSolanaChain, SolanaChain } from './solana/chains'
import { createSolanaSignInMessage } from './solana/signIn'

export const VultisigNamespace = 'vultisig:'
export type VultisigFeature = {
  [VultisigNamespace]: {
    vultisig: Solana
  }
}
export class Solana extends EventEmitter {
  public chainId: string
  public isConnected: boolean
  public isPhantom: boolean
  public isXDEFI: boolean
  public network: Network
  public publicKey?: PublicKey
  public static instance: Solana | null = null
  #account: VultisigSolanaWalletAccount | null = null
  readonly #listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][]
  } = {}
  constructor() {
    super()
    this.chainId = 'Solana_mainnet-beta'
    this.isConnected = false
    this.isPhantom = true
    this.isXDEFI = true
    this.network = 'mainnet'
  }
  get accounts() {
    return this.#account ? [this.#account] : []
  }
  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature &
    SolanaSignInFeature &
    VultisigFeature {
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
      [VultisigNamespace]: {
        vultisig: this.#vultisig,
      },
    }
  }
  static getInstance(): Solana {
    if (!Solana.instance) {
      Solana.instance = new Solana()
    }
    return Solana.instance
  }

  async signTransaction(transaction: Transaction | VersionedTransaction) {
    if (isVersionedTransaction(transaction)) {
      const result = (await this.request({
        method: RequestMethod.VULTISIG.SEND_TRANSACTION,
        params: [
          {
            serializedTx: transaction.serialize(),
            skipBroadcast: true,
          },
        ],
      })) as ITransaction<OtherChain.Solana>
      const rawData = Buffer.from(result.encoded, 'base64')
      return VersionedTransaction.deserialize(rawData)
    } else {
      const connection = new Connection(`${rootApiUrl}/solana/`)
      for (const instruction of transaction.instructions) {
        let modifiedTransfer: TransactionType.Phantom

        if (instruction.programId.equals(SystemProgram.programId)) {
          // Handle Native SOL Transfers
          const decodedTransfer = SystemInstruction.decodeTransfer(instruction)
          modifiedTransfer = {
            txType: 'Phantom',
            asset: { chain: Chain.Solana, ticker: 'SOL' },
            amount: decodedTransfer.lamports.toString(),
            from: decodedTransfer.fromPubkey.toString(),
            to: decodedTransfer.toPubkey.toString(),
            skipBroadcast: true,
          }
        } else if (instruction.programId.equals(TOKEN_PROGRAM_ID)) {
          //  Handle SPL Token Transfers
          const senderTokenAccountInfo = await getAccount(
            connection,
            new PublicKey(instruction.keys[0].pubkey)
          )
          let recipient: string
          try {
            // Try fetching receiver account
            const receiverTokenAccountInfo = await getAccount(
              connection,
              new PublicKey(instruction.keys[2].pubkey)
            )
            recipient = receiverTokenAccountInfo.owner.toString()
          } catch {
            console.warn(
              'Receiver token account not found. Checking for ATA...'
            )
            const ataInstruction = transaction.instructions.find(instr =>
              instr.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)
            )
            if (ataInstruction) {
              // The recipient should be in the ATA instruction's keys[0] (payer) or keys[2] (owner)
              recipient = ataInstruction.keys[2].pubkey.toString()
            } else {
              throw new Error(
                'Unable to determine recipient address. No direct token account or ATA instruction found.'
              )
            }
          }

          const amountBytes = instruction.data.slice(1, 9)
          const amount = new DataView(
            Uint8Array.from(amountBytes).buffer
          ).getBigUint64(0, true)

          modifiedTransfer = {
            txType: 'Phantom',
            amount: amount.toString(),
            asset: {
              chain: Chain.Solana,
              mint: senderTokenAccountInfo.mint.toString(),
            },
            from: senderTokenAccountInfo.owner.toString(),
            to: recipient,
            skipBroadcast: true,
          }
        } else {
          continue
        }
        return await this.request({
          method: RequestMethod.VULTISIG.SEND_TRANSACTION,
          params: [modifiedTransfer],
        }).then(result => {
          const rawData = Buffer.from(
            (result as ITransaction<OtherChain.Solana>).encoded,
            'base64'
          )
          return Transaction.from(rawData)
        })
      }
    }
  }

  #connected = () => {
    const address = this.publicKey?.toBase58()
    if (address) {
      const publicKey = this.publicKey!.toBytes()
      const account = this.#account

      if (
        !account ||
        account.address !== address ||
        !bytesEqual(account.publicKey, publicKey)
      ) {
        this.#account = new VultisigSolanaWalletAccount({ address, publicKey })
        this.#emit('change', { accounts: this.accounts })
      }
    }
  }

  #disconnected = () => {
    if (this.#account) {
      this.#account = null
      this.#emit('change', { accounts: this.accounts })
    }
  }

  #reconnected = () => {
    if (this.publicKey) {
      this.#connected()
    } else {
      this.#disconnected()
    }
  }

  #connect: StandardConnectMethod = async () => {
    if (!this.#account) {
      await this.request({
        method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
        params: [],
      }).then(account => {
        // this.isConnected = true
        // this.publicKey = new PublicKey(shouldBePresent(account))
        // this.emit(EventMethod.CONNECT, this.publicKey)

        return { publicKey: new PublicKey(shouldBePresent(account)) }
      })
    }

    this.#connected()

    return { accounts: this.accounts }
  }

  #disconnect: StandardDisconnectMethod = async () => {
    await this.disconnect()
  }

  #emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void {
    // eslint-disable-next-line prefer-spread
    this.#listeners[event]?.forEach(listener => listener.apply(null, args))
  }

  #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    if (!this.#account) throw new Error('not connected')

    const outputs: SolanaSignTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain } = inputs[0]!
      if (account !== this.#account) throw new Error('invalid account')
      if (chain && !isSolanaChain(chain)) throw new Error('invalid chain')

      const signedTransaction = await this.signTransaction(
        VersionedTransaction.deserialize(transaction)
      )

      const serializedTransaction = isVersionedTransaction(signedTransaction)
        ? signedTransaction.serialize()
        : new Uint8Array(
            (signedTransaction as Transaction).serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            })
          )

      outputs.push({ signedTransaction: serializedTransaction })
    } else if (inputs.length > 1) {
      let chain: SolanaChain | undefined = undefined
      for (const input of inputs) {
        if (input.account !== this.#account) throw new Error('invalid account')
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

  async connect() {
    return await this.request({
      method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
      params: [],
    }).then(account => {
      this.isConnected = true
      this.publicKey = new PublicKey(shouldBePresent(account))
      this.emit(EventMethod.CONNECT, this.publicKey)

      return { publicKey: this.publicKey }
    })
  }

  async disconnect() {
    this.isConnected = false
    this.publicKey = undefined
    this.emit(EventMethod.DISCONNECT)
    // TODO
    this.request({
      method: RequestMethod.METAMASK.WALLET_REVOKE_PERMISSIONS,
      params: [],
    })
    await Promise.resolve()
  }

  async request(data: Messaging.Chain.Request, callback?: Callback) {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: MessageKey.SOLANA_REQUEST,
          message: data,
        },
        { id: uuidv4() }
      )

      const result = processBackgroundResponse(
        data,
        MessageKey.SOLANA_REQUEST,
        response
      )

      if (callback) callback(null, result)

      return result
    } catch (error) {
      if (callback) callback(error as Error)
      throw error
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) {
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

  async signAndSendTransaction() {
    return Promise.reject({
      code: -32603,
      message: 'This function is not supported by Vultisig',
    })
  }

  async signAndSendAllTransactions() {
    return Promise.reject({
      code: -32603,
      message: 'This function is not supported by Vultisig',
    })
  }

  #signMessage: SolanaSignMessageMethod = async (...inputs) => {
    if (!this.#account) throw new Error('not connected')

    const outputs: SolanaSignMessageOutput[] = []
    if (inputs.length === 1) {
      const { message, account } = inputs[0]
      if (account !== this.#account) throw new Error('invalid account')
      const decodedString = new TextDecoder().decode(Buffer.from(message))
      const signature = await this.request({
        method: RequestMethod.CTRL.SIGN_MESSAGE,
        params: [{ message: decodedString }],
      })
      outputs.push({
        signedMessage: message,
        signature: Buffer.from(String(signature)),
      })
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(...(await this.#signMessage(input)))
      }
    }
    return outputs
    // const decodedString = new TextDecoder().decode(Buffer.from(message))
    // const signature = await this.request({
    //   method: RequestMethod.CTRL.SIGN_MESSAGE,
    //   params: [{ message: decodedString }],
    // })

    // return {
    //   account: account,
    //   signature: Buffer.from(String(signature)),
    //   signedMessage: message,
    //   signatureType: 'ed25519',
    // }
  }

  signIn = async (input: SolanaSignInInput): Promise<SolanaSignInOutput> => {
    if (!this.#account || !this.publicKey) {
      throw new Error('not connected')
    }
    const account = this.#account
    if (input?.address && input.address !== account.address) {
      throw new Error('requested address does not match connected account')
    }
    const { message, bytes } = createSolanaSignInMessage(input)
    const sig = await this.request({
      method: RequestMethod.CTRL.SIGN_MESSAGE,
      params: [{ message }],
    })
    return {
      account: account,
      signedMessage: bytes,
      signature: Uint8Array.from(Buffer.from(String(sig), 'hex')),
      signatureType: 'ed25519',
    }
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
