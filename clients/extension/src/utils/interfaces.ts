import { ThorchainProviderMethod } from '@clients/extension/src/types/thorchain'
import { ThorchainProviderResponse } from '@clients/extension/src/types/thorchain'
import { ChainTicker } from '@clients/extension/src/utils/constants'
import { Chain } from '@core/chain/Chain'
import { TransactionResponse } from 'ethers'

export namespace Messaging {
  export namespace Chain {
    export type Request = {
      method: string
      params: Record<string, any>[]
    }
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

export interface CustomMessage {
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

export interface ScreenProps {
  height: number
  width: number
}

export interface TransactionDetails {
  asset: {
    chain: string
    symbol: string
    ticker: string
  }
  from: string
  to?: string
  amount?: { amount: string; decimals: number }
  data?: string
  gasLimit?: string
}

export interface METAMASK_TRANSACTION {
  from: string
  to: string
  value?: string
  data: string
  gas?: string
  gasPrice?: string
  nonce?: string
  chainId?: string
  type?: string
}

export interface CTRL_TRANSACTION {
  amount: {
    amount: string
    decimals: number
  }
  asset: {
    chain: ChainTicker
    symbol: string
    ticker: string
  }
  from: string
  gasLimit?: string
  memo: string
  recipient: string
}

export interface TransactionProps {
  transactionDetails: TransactionDetails
  chain: ChainProps
  contract?: string
  customMessage?: CustomMessage
  customSignature?: string
  id: string
  status: 'default' | 'error' | 'pending' | 'success'
  memo?: string
  gas?: string
  gasLimit?: string
  gasPrice?: string
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
  transactions: TransactionProps[]
  uid: string
}

export interface ParsedMemo {
  signature: string
  inputs: string
}

export interface ThorchainAccountDataResponse {
  address: string
  publicKey: {
    type: string
    value: string
  }
  accountNumber: string
  sequence: string
}

export interface MayaAccountDataResponse {
  address: string
  publicKey: {
    type: string
    value: string
  }
  accountNumber: string
  sequence: string
}

export interface BaseSpecificTransactionInfo {
  gasPrice: number
  fee: number
}

export interface SpecificThorchain extends BaseSpecificTransactionInfo {
  accountNumber: number
  sequence: number
  isDeposit: boolean
}

export interface SpecificCosmos extends BaseSpecificTransactionInfo {
  accountNumber: number
  sequence: number
  gas: number
  transactionType: number
}

export interface SpecificThorchain {
  fee: number
  gasPrice: number
  accountNumber: number
  sequence: number
  isDeposit: boolean
}

export interface CosmosAccountData {
  accountNumber: string
  sequence: string
}

export interface CosmosAccountDataResponse {
  account: CosmosAccountData
}

export interface SignedTransaction {
  inputData?: Uint8Array
  signature: SignatureProps
  transaction?: TransactionProps
  vault?: VaultProps
}

export interface SpecificUtxoInfo {
  hash: string
  amount: bigint
  index: number
}

export interface SpecificUtxo extends BaseSpecificTransactionInfo {
  byteFee: number
  sendMaxAmount: boolean
  utxos: SpecificUtxoInfo[]
}

export interface SpecificSolana extends BaseSpecificTransactionInfo {
  recentBlockHash: string
  priorityFee: number
  fromAddressPubKey: string | undefined
  toAddressPubKey: string | undefined
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
