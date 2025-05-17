import { Chain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  Connection,
  PublicKey,
  SystemInstruction,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import base58 from 'bs58'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey, RequestMethod } from '../../utils/constants'
import {
  isVersionedTransaction,
  processBackgroundResponse,
} from '../../utils/functions'
import {
  Messaging,
  SendTransactionResponse,
  TransactionType,
} from '../../utils/interfaces'
import { Callback, Network } from '../constants'
import { messengers } from '../messenger'

export class Solana extends EventEmitter {
  public chainId: string
  public isConnected: boolean
  public isPhantom: boolean
  public isXDEFI: boolean
  public network: Network
  public publicKey?: PublicKey
  public static instance: Solana | null = null
  constructor() {
    super()
    this.chainId = 'Solana_mainnet-beta'
    this.isConnected = false
    this.isPhantom = true
    this.isXDEFI = true
    this.network = 'mainnet'
  }

  static getInstance(): Solana {
    if (!Solana.instance) {
      Solana.instance = new Solana()
    }
    return Solana.instance
  }

  async signTransaction(transaction: Transaction | VersionedTransaction) {
    if (isVersionedTransaction(transaction)) {
      return await this.request({
        method: RequestMethod.VULTISIG.SEND_TRANSACTION,
        params: [
          {
            serializedTx: transaction.serialize(),
          },
        ],
      }).then((result: SendTransactionResponse) => {
        const rawData = base58.decode(result.raw)
        return VersionedTransaction.deserialize(rawData)
      })
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
          }
        } else {
          continue
        }
        return await this.request({
          method: RequestMethod.VULTISIG.SEND_TRANSACTION,
          params: [modifiedTransfer],
        }).then((result: SendTransactionResponse) => {
          const rawData = base58.decode(result.raw)
          return VersionedTransaction.deserialize(rawData)
        })
      }
    }
  }

  async connect() {
    return await this.request({
      method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
      params: [],
    }).then(account => {
      this.isConnected = true
      this.publicKey = new PublicKey(account)
      this.emit(EventMethod.CONNECT, this.publicKey)

      return { publicKey: this.publicKey }
    })
  }

  async disconnect() {
    this.isConnected = false
    this.publicKey = undefined
    this.emit(EventMethod.DISCONNECT)

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

  async signAllTransactions(transactions: Transaction[]) {
    if (!transactions || !transactions.length) {
      return Promise.reject({
        code: -32000,
        message: 'Missing or invalid parameters.',
      })
    }

    const results: VersionedTransaction[] = []

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

  async signMessage() {
    return Promise.reject({
      code: -32603,
      message: 'This function is not supported by Vultisig',
    })
  }

  async signIn() {
    return Promise.reject({
      code: -32603,
      message: 'This function is not supported by Vultisig',
    })
  }

  async handleNotification() {
    return Promise.reject({
      code: -32603,
      message: 'This function is not supported by Vultisig',
    })
  }
}
