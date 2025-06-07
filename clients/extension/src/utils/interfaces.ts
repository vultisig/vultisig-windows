import { ThorchainProviderMethod } from '@clients/extension/src/types/thorchain'
import { ThorchainProviderResponse } from '@clients/extension/src/types/thorchain'
import { Chain } from '@core/chain/Chain'
import { ParsedMemoParams } from '@core/chain/chains/evm/tx/getParsedMemo'
import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { IMsgTransfer } from '@core/mpc/keysign/preSignedInputData/ibc/IMsgTransfer'
import { TransactionResponse } from 'ethers'

export namespace Messaging {
  export namespace Chain {
    export type Request = { method: string; params: Record<string, any>[] }
    export type Response =
      | string
      | string[]
      | ThorchainProviderResponse<ThorchainProviderMethod>
      | TransactionResponse
      | TxResult
  }

  export namespace GetVault {
    export type Request = any
    export type Response = VaultExport | undefined
  }

  export namespace GetVaults {
    export type Request = any
    export type Response = VaultExport[]
  }

  export namespace SetPriority {
    export type Request = { priority?: boolean }
    export type Response = any
  }

  export namespace Plugin {
    export type Request = { method: string; params: Record<string, any>[] }
    export type Response = string
  }
}

export type VaultExport = {
  uid: string
  name: string
  publicKeyEcdsa: string
  publicKeyEddsa: string
  hexChainCode: string
}

export interface AccountsProps {
  chain: Chain
  sender: string
}

interface ICustomTransactionPayload {
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

export type IKeysignTransactionPayload = {
  transactionDetails: TransactionDetails
  chain: Chain
  contract?: string
  memo?: {
    isParsed: boolean
    value: string | ParsedMemoParams | undefined
  }
  gas?: string
  gasLimit?: string
  txFee?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  isDeposit?: boolean
}

type ITransactionPayload =
  | {
      keysign: IKeysignTransactionPayload
    }
  | {
      custom: ICustomTransactionPayload
    }
  | { serialized: Uint8Array }

export interface ITransaction {
  id?: string
  status: 'default' | 'error' | 'pending' | 'success'
  transactionPayload: ITransactionPayload
  txHash?: string
  encoded?: any
  windowId?: number
}
