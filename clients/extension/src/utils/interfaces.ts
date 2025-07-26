import { ThorchainProviderMethod } from '@clients/extension/src/types/thorchain'
import { ThorchainProviderResponse } from '@clients/extension/src/types/thorchain'
import { Chain } from '@core/chain/Chain'
import { ParsedMemoParams } from '@core/chain/chains/evm/tx/getParsedMemo'
import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { StdSignDoc } from '@keplr-wallet/types'
import { TransactionResponse } from 'ethers'

import { CosmosMsgType } from './constants'

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

export type AccountsProps = {
  chain: Chain
  sender: string
}

export type PluginRequestProps = {
  id: string
}

type ICustomTransactionPayload = {
  method: string
  address: string
  message: string
}

export namespace TransactionType {
  export type TxType = 'MetaMask' | 'Ctrl' | 'Vultisig' | 'Keplr' | 'Phantom'

  type BaseTransaction<T extends TxType> = {
    txType: T
  }

  export type MetaMask = {
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
  } & BaseTransaction<'MetaMask'>

  export type Ctrl = {
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
  } & BaseTransaction<'Ctrl'>

  export type Vultisig = {
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
  } & BaseTransaction<'Vultisig'>

  export type Keplr = (
    | StdSignDoc
    | {
        bodyBytes: string // base64 encoded
        authInfoBytes: string // base64 encoded
        chainId: string
        accountNumber: string // stringified Long
      }
  ) &
    BaseTransaction<'Keplr'>

  export type Phantom = {
    asset: {
      chain: Chain
      ticker?: string
      symbol?: string
      mint?: string
    }
    from: string
    to?: string
    amount: string
  } & BaseTransaction<'Phantom'>

  export type WalletTransaction = MetaMask | Ctrl | Keplr | Phantom | Vultisig
}

type IMsgTransfer = {
  sourcePort: string
  sourceChannel: string
  token: {
    denom: string
    amount: string
  }
  sender: string
  receiver: string
  timeoutHeight: {
    revisionNumber: string
    revisionHeight: string
  }
  timeoutTimestamp: string
  memo: string
}

export type CosmosMsgPayload =
  | {
      case:
        | CosmosMsgType.MSG_SEND
        | CosmosMsgType.THORHCAIN_MSG_SEND
        | CosmosMsgType.MSG_SEND_URL
      value: {
        amount: { denom: string; amount: string }[]
        from_address: string
        to_address: string
      }
    }
  | {
      case: CosmosMsgType.MSG_EXECUTE_CONTRACT
      value: {
        sender: string
        contract: string
        funds: { denom: string; amount: string }[]
        msg: string
      }
    }
  | {
      case: CosmosMsgType.MSG_TRANSFER_URL
      value: IMsgTransfer
    }

export type TransactionDetails = {
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
  cosmosMsgPayload?: CosmosMsgPayload
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

export type ITransaction = {
  id?: string
  status: 'default' | 'error' | 'pending' | 'success'
  transactionPayload: ITransactionPayload
  txHash?: string
  encoded?: any
  windowId?: number
}
