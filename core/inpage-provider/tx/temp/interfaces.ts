import { Chain } from '@core/chain/Chain'
import { ParsedMemoParams } from '@core/chain/chains/evm/tx/getParsedMemo'

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

export type RequestInput = {
  method: string
  params: Record<string, any>[]
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
  data: string
  skipBroadcast?: boolean
  chain: Chain
}

export type ITransactionPayload =
  | {
      keysign: IKeysignTransactionPayload
    }
  | { serialized: ISerializedTransactionPayload }
