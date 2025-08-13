import {
  SolanaSignAndSendTransaction,
  SolanaSignIn,
  SolanaSignMessage,
  SolanaSignTransaction,
} from '@solana/wallet-standard-features'
import type { WalletAccount } from '@wallet-standard/base'

import { SolanaChains } from './chains'

const chains = SolanaChains
const features = [
  SolanaSignAndSendTransaction,
  SolanaSignTransaction,
  SolanaSignMessage,
  SolanaSignIn,
] as const

export class VultisigSolanaWalletAccount implements WalletAccount {
  readonly address: WalletAccount['address']
  readonly #publicKey: WalletAccount['publicKey']
  readonly #chains: WalletAccount['chains']
  readonly #features: WalletAccount['features']
  readonly label: WalletAccount['label']
  readonly icon: WalletAccount['icon']

  get publicKey() {
    return this.#publicKey.slice()
  }

  get chains() {
    return this.#chains.slice()
  }

  get features() {
    return this.#features.slice()
  }

  constructor({
    address,
    publicKey,
    label,
    icon,
  }: Omit<WalletAccount, 'chains' | 'features'>) {
    this.address = address
    this.#publicKey = publicKey
    this.#chains = chains
    this.#features = features
    this.label = label
    this.icon = icon
    Object.freeze(this)
  }
}
