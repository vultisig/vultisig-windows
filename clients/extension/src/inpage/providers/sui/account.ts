import type {
  SuiSignPersonalMessageFeature,
  SuiSignTransactionFeature,
} from '@mysten/wallet-standard'
import type { WalletAccount } from '@wallet-standard/base'

import { SuiChains } from './chains'

const chains = SuiChains
const features = [
  'sui:signTransaction',
  'sui:signAndExecuteTransaction',
  'sui:signPersonalMessage',
] as const satisfies (
  | keyof SuiSignTransactionFeature
  | keyof SuiSignPersonalMessageFeature
  | 'sui:signAndExecuteTransaction'
)[]

export class VultisigSuiWalletAccount implements WalletAccount {
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
