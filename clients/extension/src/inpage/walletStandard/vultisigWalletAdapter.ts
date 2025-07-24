import {
  Transaction,
  VersionedTransaction,
  SendOptions,
  PublicKey,
} from '@solana/web3.js'
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

import { Solana } from '@clients/extension/src/inpage/providers/solana'
import { Vultisig } from './vultisig/src/window'

export class VultisigWalletAdapter implements Vultisig {
  private solana: Solana
  on: typeof this.solana.on
  off: typeof this.solana.off
  addListener: typeof this.solana.addListener
  removeListener: typeof this.solana.removeListener

  constructor() {
    this.solana = Solana.getInstance()

    this.on = this.solana.on.bind(this.solana)
    this.off = this.solana.off.bind(this.solana)
    this.addListener = this.solana.addListener.bind(this.solana)
    this.removeListener = this.solana.removeListener.bind(this.solana)
  }

  get publicKey(): PublicKey | null {
    return this.solana.publicKey ?? null
  }

  async connect(_options?: {
    onlyIfTrusted?: boolean
  }): Promise<{ publicKey: PublicKey }> {
    return this.solana.connect()
  }

  async disconnect(): Promise<void> {
    await this.solana.disconnect()
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    return this.solana.signTransaction(transaction) as Promise<T>
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    return this.solana.signAllTransactions(
      transactions as Transaction[]
    ) as Promise<T[]>
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: string }> {
    return this.solana.signAndSendTransaction() as unknown as Promise<{
      signature: string
    }>
  }

  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    return this.solana.signMessage(message)
  }

  async signIn(input: SolanaSignInInput): Promise<SolanaSignInOutput> {
    return this.solana.signIn(input)
  }
}
