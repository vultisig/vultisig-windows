import { ThorchainProviderMethod } from '@clients/extension/src/types/thorchain'
import { ThorchainProviderResponse } from '@clients/extension/src/types/thorchain'
import { Chain } from '@core/chain/Chain'
import { ParsedMemoParams } from '@core/chain/chains/evm/tx/getParsedMemo'
import { KeysignResponse } from '@core/chain/tx/signature/generateSignature'
import { WalletCore } from '@trustwallet/wallet-core'
import { TransactionResponse } from 'ethers'

import { Currency } from './constants'

export namespace Messaging {
  export namespace Chain {
    export type Request = { method: string; params: Record<string, any>[] }
    export type Response =
      | string
      | string[]
      | ThorchainProviderResponse<ThorchainProviderMethod>
      | TransactionResponse
      | SendTransactionResponse
  }

  export namespace GetVault {
    export type Request = any
    export type Response = VaultProps | undefined
  }

  export namespace GetVaults {
    export type Request = any
    export type Response = VaultProps[]
  }

  export namespace SetPriority {
    export type Request = { priority?: boolean }
    export type Response = any
  }
}

export interface AccountsProps {
  chain: Chain
  sender: string
}

export interface ChainProps {
  active?: boolean
  address?: string
  cmcId?: number
  decimals: number
  derivationKey?: string
  id: string
  chain: Chain
  ticker: string
}

export interface SendTransactionResponse {
  raw: any
  txResponse: string
}

export interface CurrencyRef {
  [Currency.AUD]: string
  [Currency.CAD]: string
  [Currency.CNY]: string
  [Currency.EUR]: string
  [Currency.GBP]: string
  [Currency.JPY]: string
  [Currency.RUB]: string
  [Currency.SEK]: string
  [Currency.SGD]: string
  [Currency.USD]: string
}

interface CustomMessage {
  method: string
  address: string
  message: string
}

export interface SignatureProps {
  Msg: string
  R: string
  S: string
  DerSignature: string
  RecoveryID: string
}

export namespace TransactionType {
  export type TxType = 'MetaMask' | 'Ctrl' | 'Vultisig' | 'Keplr' | 'Phantom'

  interface BaseTransaction<T extends TxType> {
    txType: T
  }

  export interface MetaMask extends BaseTransaction<'MetaMask'> {
    from: string
    to: string
    value?: string
    data: string
    gas?: string
    gasPrice?: string
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
    nonce?: string
    chainId?: string
    type?: string
  }

  export interface Ctrl extends BaseTransaction<'Ctrl'> {
    amount: {
      amount: string
      decimals: number
    }
    asset: {
      chain: Chain
      symbol: string
      ticker: string
    }
    from: string
    gasLimit?: string
    memo: string
    recipient: string
  }

  export interface Vultisig extends BaseTransaction<'Vultisig'> {
    asset: {
      chain: Chain
      ticker: string
      symbol?: string
    }
    from: string
    to?: string
    amount?: { amount: string; decimals: number }
    data?: string
    gasLimit?: string
  }

  export interface Keplr extends BaseTransaction<'Keplr'> {
    amount: { amount: string; denom: string }[]
    from_address: string
    to_address: string
  }

  export interface Phantom extends BaseTransaction<'Phantom'> {
    asset: {
      chain: Chain
      ticker?: string
      symbol?: string
      mint?: string
    }
    from: string
    to?: string
    amount: string
  }

  export type WalletTransaction = MetaMask | Ctrl | Keplr | Phantom | Vultisig
}

export interface TransactionDetails {
  asset: {
    chain: Chain
    ticker: string
    symbol?: string
    mint?: string
  }
  from: string
  to?: string
  amount?: { amount: string; decimals: number }
  data?: string
  gasSettings?: {
    gasLimit?: string
    gasPrice?: string
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
  }
}

export interface ITransaction {
  transactionDetails: TransactionDetails
  chain: ChainProps
  contract?: string
  customMessage?: CustomMessage
  customSignature?: string
  id: string
  status: 'default' | 'error' | 'pending' | 'success'
  memo?: {
    isParsed: boolean
    value: string | ParsedMemoParams | undefined
  }
  gas?: string
  gasLimit?: string
  txFee?: string
  isDeposit?: boolean
  isCustomMessage?: boolean
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  txHash?: string
  windowId?: number
  raw?: any
}

export interface VaultProps {
  active?: boolean
  apps?: string[]
  chains: ChainProps[]
  hexChainCode: string
  name: string
  publicKeyEcdsa: string
  publicKeyEddsa: string
  selected?: boolean
  transactions: ITransaction[]
  uid: string
}

export interface SignedTransaction {
  inputData?: Uint8Array
  signatures: Record<string, KeysignResponse>
  transaction?: ITransaction
  vault?: VaultProps
  walletCore: WalletCore
}

export interface FastSignInput {
  public_key: string
  messages: string[]
  session: string
  hex_encryption_key: string
  derive_path: string
  is_ecdsa: boolean
  vault_password: string
}
