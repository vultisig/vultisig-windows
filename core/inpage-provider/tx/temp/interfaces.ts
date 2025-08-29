import { Chain } from '@core/chain/Chain'
import { ParsedMemoParams } from '@core/chain/chains/evm/tx/getParsedMemo'
import { StdSignDoc } from '@keplr-wallet/types'

export enum CosmosMsgType {
  MSG_SEND = 'cosmos-sdk/MsgSend',
  THORCHAIN_MSG_SEND = 'thorchain/MsgSend',
  MSG_EXECUTE_CONTRACT = 'wasm/MsgExecuteContract',
  MSG_EXECUTE_CONTRACT_URL = '/cosmwasm.wasm.v1.MsgExecuteContract',
  MSG_TRANSFER_URL = '/ibc.applications.transfer.v1.MsgTransfer',
  MSG_SEND_URL = '/cosmos.bank.v1beta1.MsgSend',
  THORCHAIN_MSG_DEPOSIT = 'thorchain/MsgDeposit',
  THORCHAIN_MSG_DEPOSIT_URL = '/types.MsgDeposit',
}

export type ProviderId =
  | 'vultisig'
  | 'phantom-override'
  | 'keplr-override'
  | 'ctrl-override'

type BitcoinAccountPurpose = 'payment' | 'ordinals'

export type BitcoinAccount = {
  address: string
  publicKey: string
  addressType: string
  purpose: BitcoinAccountPurpose
}

export namespace TransactionType {
  export type TxType = 'MetaMask' | 'Ctrl' | 'Vultisig' | 'Keplr' | 'Phantom'

  type BaseTransaction<T extends TxType> = {
    txType: T
    skipBroadcast?: boolean
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
      chain: string
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
      chain: string
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
      chain: string
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

type IMsgDeposit = {
  coins: {
    amount: string
    asset: string
  }[]
  signer: string
  memo: string
}

export type CosmosMsgPayload =
  | {
      case:
        | CosmosMsgType.MSG_SEND
        | CosmosMsgType.THORCHAIN_MSG_SEND
        | CosmosMsgType.MSG_SEND_URL
      value: {
        amount: { denom: string; amount: string }[]
        from_address: string
        to_address: string
      }
    }
  | {
      case:
        | CosmosMsgType.MSG_EXECUTE_CONTRACT
        | CosmosMsgType.MSG_EXECUTE_CONTRACT_URL
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
  | {
      case: CosmosMsgType.THORCHAIN_MSG_DEPOSIT
      value: IMsgDeposit
    }

export type TransactionDetailsAsset = {
  chain: string
  ticker: string
  symbol?: string
  mint?: string
}

export type TransactionDetails = {
  asset: TransactionDetailsAsset
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
  skipBroadcast?: boolean
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

type ISerializedTransactionPayload = {
  data: Uint8Array
  skipBroadcast?: boolean
  chain: Chain
}

export type ITransactionPayload =
  | {
      keysign: IKeysignTransactionPayload
    }
  | { serialized: ISerializedTransactionPayload }
