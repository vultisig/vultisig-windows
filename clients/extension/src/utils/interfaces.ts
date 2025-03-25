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

export interface ChainObjRef {
  [Chain.Arbitrum]: ChainProps
  [Chain.Avalanche]: ChainProps
  [Chain.Base]: ChainProps
  [Chain.Bitcoin]: ChainProps
  [Chain.BitcoinCash]: ChainProps
  [Chain.Blast]: ChainProps
  [Chain.BSC]: ChainProps
  [Chain.CronosChain]: ChainProps
  [Chain.Dash]: ChainProps
  [Chain.Dogecoin]: ChainProps
  [Chain.Dydx]: ChainProps
  [Chain.Ethereum]: ChainProps
  [Chain.Cosmos]: ChainProps
  [Chain.Kujira]: ChainProps
  [Chain.Litecoin]: ChainProps
  [Chain.MayaChain]: ChainProps
  [Chain.Optimism]: ChainProps
  [Chain.Osmosis]: ChainProps
  [Chain.Polygon]: ChainProps
  [Chain.Solana]: ChainProps
  [Chain.THORChain]: ChainProps
}

export interface ChainStrRef {
  [Chain.Arbitrum]: string
  [Chain.Avalanche]: string
  [Chain.Base]: string
  [Chain.Bitcoin]: string
  [Chain.BitcoinCash]: string
  [Chain.Blast]: string
  [Chain.BSC]: string
  [Chain.CronosChain]: string
  [Chain.Dash]: string
  [Chain.Dogecoin]: string
  [Chain.Dydx]: string
  [Chain.Ethereum]: string
  [Chain.Cosmos]: string
  [Chain.Kujira]: string
  [Chain.Litecoin]: string
  [Chain.MayaChain]: string
  [Chain.Optimism]: string
  [Chain.Osmosis]: string
  [Chain.Polkadot]: string
  [Chain.Polygon]: string
  [Chain.Solana]: string
  [Chain.Sui]: string
  [Chain.THORChain]: string
  [Chain.Terra]: string
  [Chain.TerraClassic]: string
  [Chain.Ton]: string
  [Chain.Ripple]: string
  [Chain.Zksync]: string
  [Chain.Noble]: string
  [Chain.Akash]: string
  [Chain.Tron]: string
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
  gasLimit?: string
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
  signatures: Record<string, KeysignResponse>
  transaction?: ITransaction
  vault?: VaultProps
  walletCore: WalletCore
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
