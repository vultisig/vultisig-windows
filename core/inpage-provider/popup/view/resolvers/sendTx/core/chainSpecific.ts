import { isChainOfKind } from '@core/chain/ChainKind'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import {
  CosmosSpecific,
  EthereumSpecific,
  TransactionType,
  TronSpecific,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { CustomTxData } from '../core/customTxData'
import { ParsedTx } from '../core/parsedTx'
import { CosmosMsgType, TronMsgType } from '../interfaces'

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

type GetChainSpecificInput = ParsedTx & {
  evmFeeSettings?: EvmFeeSettings
}

export const getChainSpecificInput = (input: GetChainSpecificInput) => {
  const { coin, customTxData, thirdPartyGasLimitEstimation, evmFeeSettings } =
    input

  const amount = matchRecordUnion<CustomTxData, bigint>(customTxData, {
    regular: ({ transactionDetails }) =>
      BigInt(transactionDetails.amount?.amount ?? 0),
    solana: tx => {
      const { inAmount } = getRecordUnionValue(tx)
      return BigInt(inAmount ?? 0)
    },
    psbt: psbt => {
      const { sendAmount } = getPsbtTransferInfo(psbt, coin.address)
      return sendAmount
    },
  })

  const isDeposit = matchRecordUnion<CustomTxData, boolean>(customTxData, {
    regular: ({ transactionDetails, isDeposit }) =>
      isDeposit ||
      transactionDetails.msgPayload?.case ===
        CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
    solana: () => false,
    psbt: () => false,
  })

  const receiver = matchRecordUnion<CustomTxData, string>(customTxData, {
    regular: ({ transactionDetails }) => transactionDetails.to ?? '',
    solana: tx => getRecordUnionValue(tx).authority,
    psbt: () => '',
  })

  const result: ChainSpecificResolverInput = {
    coin,
    amount,
    isDeposit,
    receiver,
    psbt: 'psbt' in customTxData ? customTxData.psbt : undefined,
    isComplexTx: isChainOfKind(coin.chain, 'utxo') ? true : undefined,
    thirdPartyGasLimitEstimation,
    feeQuote:
      evmFeeSettings ||
      (thirdPartyGasLimitEstimation
        ? { gasLimit: thirdPartyGasLimitEstimation }
        : undefined),
  }

  if ('regular' in customTxData) {
    const { regular } = customTxData
    const { transactionDetails } = regular
    const { msgPayload } = transactionDetails
    result.transactionType = msgPayload?.case
      ? cosmosMsgTypeToTransactionType[msgPayload.case]
      : defaultTransactionType

    if (msgPayload?.case === CosmosMsgType.MSG_TRANSFER_URL) {
      const { timeoutTimestamp } = msgPayload.value
      if (timeoutTimestamp) {
        ;(
          result as ChainSpecificResolverInput<CosmosSpecific>
        ).timeoutTimestamp = timeoutTimestamp
      }
    }
    ;(result as ChainSpecificResolverInput<EthereumSpecific>).data =
      regular.transactionDetails.data

    if (
      isChainOfKind(coin.chain, 'tron') &&
      regular.transactionDetails.msgPayload &&
      'meta' in regular.transactionDetails.msgPayload
    ) {
      const meta = regular.transactionDetails.msgPayload.meta
      if (meta) {
        ;(result as ChainSpecificResolverInput<TronSpecific>).expiration =
          meta.expiration
        ;(result as ChainSpecificResolverInput<TronSpecific>).timestamp =
          meta.timestamp
        ;(result as ChainSpecificResolverInput<TronSpecific>).refBlockBytesHex =
          meta.refBlockBytesHex
        ;(result as ChainSpecificResolverInput<TronSpecific>).refBlockHashHex =
          meta.refBlockHashHex
      }
    }
  }

  return result
}
