import { Chain } from '@core/chain/Chain'

export enum CosmosMsgType {
  MSG_SEND = 'cosmos-sdk/MsgSend',
  THORCHAIN_MSG_SEND = 'thorchain/MsgSend',
  MSG_EXECUTE_CONTRACT = 'wasm/MsgExecuteContract',
  MSG_EXECUTE_CONTRACT_URL = '/cosmwasm.wasm.v1.MsgExecuteContract',
  MSG_TRANSFER_URL = '/ibc.applications.transfer.v1.MsgTransfer',
  MSG_SEND_URL = '/cosmos.bank.v1beta1.MsgSend',
  THORCHAIN_MSG_DEPOSIT = 'thorchain/MsgDeposit',
  THORCHAIN_MSG_DEPOSIT_URL = '/types.MsgDeposit',
  THORCHAIN_MSG_SEND_URL = '/types.MsgSend',
}
export enum TronMsgType {
  TRON_TRANSFER_CONTRACT = 'TransferContract',
  TRON_TRIGGER_SMART_CONTRACT = 'TriggerSmartContract',
  TRON_TRANSFER_ASSET_CONTRACT = 'TransferAssetContract',
}

type TronTransferContract = {
  to_address: string
  owner_address: string
  amount: number
}

type TronTriggerSmartContract = {
  owner_address: string
  contract_address: string
  call_value?: number
  call_token_value?: number
  token_id?: number
  data?: string
}

type TronTransferAssetContract = {
  to_address: string
  owner_address: string
  amount: number
  asset_name: string
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

export enum XDEFIBitcoinPayloadMethods {
  SignPsbt = 'sign_psbt',
}

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

type TronTxMeta = {
  timestamp: number
  expiration: number
  refBlockBytesHex: string
  refBlockHashHex: string
}

export type MsgPayload =
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
  | {
      case: CosmosMsgType.THORCHAIN_MSG_SEND_URL
      value: {
        amount: { denom: string; amount: string }[]
        fromAddress: string
        toAddress: string
      }
    }
  | {
      case: TronMsgType.TRON_TRANSFER_CONTRACT
      value: TronTransferContract
      meta?: TronTxMeta
    }
  | {
      case: TronMsgType.TRON_TRIGGER_SMART_CONTRACT
      value: TronTriggerSmartContract
      meta?: TronTxMeta
    }
  | {
      case: TronMsgType.TRON_TRANSFER_ASSET_CONTRACT
      value: TronTransferAssetContract
      meta?: TronTxMeta
    }

type TransactionDetailsAsset = {
  ticker: string
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
  msgPayload?: MsgPayload
  skipBroadcast?: boolean
}

export type DepositTransactionDetails = {
  asset: { chain: string; ticker: string; symbol: string }
  from: string
  recipient?: string
  amount?: { amount: string; decimals: number }
  memo?: string
}

export type IKeysignTransactionPayload = {
  transactionDetails: TransactionDetails
  chain: Chain
  contract?: string
  gas?: string
  gasLimit?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  isDeposit?: boolean
}

type ISerializedTransactionPayload = {
  data: string
  skipBroadcast?: boolean
  chain: Chain
  params?: Record<string, any>[]
}

export type ITransactionPayload =
  | {
      keysign: IKeysignTransactionPayload
    }
  | { serialized: ISerializedTransactionPayload }
