import { isChainOfKind } from '@core/chain/ChainKind'
import { KeysignTxDataResolverInput } from '@core/mpc/keysign/txData/resolver'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { CosmosMsgType, TronMsgType } from '../interfaces'
import { getTxAmount } from './amount'
import { CustomTxData } from './customTxData'
import { ParsedTx } from './parsedTx'
import { getTxReceiver } from './receiver'

const defaultTransactionType = TransactionType.UNSPECIFIED

const cosmosMsgTypeToTransactionType: Record<
  CosmosMsgType | TronMsgType,
  TransactionType
> = {
  [CosmosMsgType.MSG_SEND]: defaultTransactionType,
  [CosmosMsgType.THORCHAIN_MSG_SEND]: defaultTransactionType,
  [CosmosMsgType.MSG_SEND_URL]: defaultTransactionType,
  [CosmosMsgType.MSG_TRANSFER_URL]: TransactionType.IBC_TRANSFER,
  [CosmosMsgType.MSG_EXECUTE_CONTRACT]: TransactionType.GENERIC_CONTRACT,
  [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: TransactionType.GENERIC_CONTRACT,
  [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: defaultTransactionType,
  [CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL]: defaultTransactionType,
  [CosmosMsgType.THORCHAIN_MSG_SEND_URL]: defaultTransactionType,
  [TronMsgType.TRON_TRANSFER_CONTRACT]: defaultTransactionType,
  [TronMsgType.TRON_TRIGGER_SMART_CONTRACT]: defaultTransactionType,
  [TronMsgType.TRON_TRANSFER_ASSET_CONTRACT]: defaultTransactionType,
}

export const getKeysignTxDataInput = (parsedTx: ParsedTx) => {
  const amount = getTxAmount(parsedTx)

  const { coin, customTxData } = parsedTx

  const isDeposit = matchRecordUnion<CustomTxData, boolean>(customTxData, {
    regular: ({ transactionDetails, isDeposit }) =>
      isDeposit ||
      transactionDetails.msgPayload?.case ===
        CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
    solana: () => false,
    psbt: () => false,
  })

  const receiver = getTxReceiver(customTxData)

  const getTransactionType = () => {
    if ('regular' in customTxData) {
      const { regular } = customTxData
      const { transactionDetails } = regular
      const { msgPayload } = transactionDetails
      return msgPayload?.case
        ? cosmosMsgTypeToTransactionType[msgPayload.case]
        : defaultTransactionType
    }
  }

  const result: KeysignTxDataResolverInput = {
    coin,
    amount,
    isDeposit,
    receiver,
    psbt: 'psbt' in customTxData ? customTxData.psbt : undefined,
    transactionType: getTransactionType(),
  }

  if ('regular' in customTxData) {
    const { regular } = customTxData
    const { transactionDetails } = regular
    const { msgPayload } = transactionDetails

    if (msgPayload?.case === CosmosMsgType.MSG_TRANSFER_URL) {
      const { timeoutTimestamp } = msgPayload.value
      if (timeoutTimestamp) {
        ;(result as KeysignTxDataResolverInput<'cosmos'>).timeoutTimestamp =
          timeoutTimestamp
      }
    }

    if (
      isChainOfKind(coin.chain, 'tron') &&
      regular.transactionDetails.msgPayload &&
      'meta' in regular.transactionDetails.msgPayload
    ) {
      const meta = regular.transactionDetails.msgPayload.meta
      if (meta) {
        ;(result as KeysignTxDataResolverInput<'tron'>).expiration =
          meta.expiration
        ;(result as KeysignTxDataResolverInput<'tron'>).timestamp =
          meta.timestamp
        ;(result as KeysignTxDataResolverInput<'tron'>).refBlockBytesHex =
          meta.refBlockBytesHex
        ;(result as KeysignTxDataResolverInput<'tron'>).refBlockHashHex =
          meta.refBlockHashHex
      }
    }
  }

  return result
}
