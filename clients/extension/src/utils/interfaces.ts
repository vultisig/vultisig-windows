import { ThorchainProviderMethod } from '@clients/extension/src/types/thorchain'
import { ThorchainProviderResponse } from '@clients/extension/src/types/thorchain'
import { Chain } from '@core/chain/Chain'
import { ParsedMemoParams } from '@core/chain/chains/evm/tx/getParsedMemo'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { IMsgTransfer } from '@core/mpc/keysign/preSignedInputData/ibc/IMsgTransfer'
import { Vault as VaultCore } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'
import { TransactionResponse } from 'ethers'

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
    export type Response = Vault | undefined
  }

  export namespace GetVaults {
    export type Request = any
    export type Response = Vault[]
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

interface CustomMessage {
  method: string
  address: string
  message: string
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
  ibcTransaction?: IMsgTransfer
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

export type Vault = VaultCore & {
  // Keep legacy fields temporarily (to be removed later)
  //TODO: active chain removed, other properties will be extracted in separate PRs
  transactions: ITransaction[]
  apps?: string[]
  selected?: boolean
  chains: ChainProps[]
  uid: string
}

export interface SignedTransaction {
  inputData?: Uint8Array
  signatures: Record<string, KeysignSignature>
  transaction?: ITransaction
  vault?: Vault
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
