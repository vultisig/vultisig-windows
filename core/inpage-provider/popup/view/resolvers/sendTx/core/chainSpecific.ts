import { isChainOfKind } from '@core/chain/ChainKind'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { byteFeeMultiplier } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import {
  CosmosSpecific,
  EthereumSpecific,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { CustomTxData } from '../core/customTxData'
import { ParsedTx } from '../core/parsedTx'
import { CosmosMsgType } from '../interfaces'

const defaultTransactionType = TransactionType.UNSPECIFIED

const cosmosMsgTypeToTransactionType: Record<CosmosMsgType, TransactionType> = {
  [CosmosMsgType.MSG_SEND]: defaultTransactionType,
  [CosmosMsgType.THORCHAIN_MSG_SEND]: defaultTransactionType,
  [CosmosMsgType.MSG_SEND_URL]: defaultTransactionType,
  [CosmosMsgType.MSG_TRANSFER_URL]: TransactionType.IBC_TRANSFER,
  [CosmosMsgType.MSG_EXECUTE_CONTRACT]: TransactionType.GENERIC_CONTRACT,
  [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: TransactionType.GENERIC_CONTRACT,
  [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: defaultTransactionType,
  [CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL]: defaultTransactionType,
}

export const getChainSpecificInput = (input: ParsedTx) => {
  const { coin, customTxData, feeSettings } = input

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
      transactionDetails.cosmosMsgPayload?.case ===
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
    byteFeeMultiplier: isChainOfKind(coin.chain, 'utxo')
      ? byteFeeMultiplier.fast
      : undefined,
    feeQuote:
      feeSettings && isChainOfKind(coin.chain, 'evm')
        ? (feeSettings as EvmFeeSettings)
        : undefined,
  }

  if ('regular' in customTxData) {
    const { regular } = customTxData
    const { transactionDetails } = regular
    const { cosmosMsgPayload } = transactionDetails
    result.transactionType = cosmosMsgPayload?.case
      ? cosmosMsgTypeToTransactionType[cosmosMsgPayload.case]
      : defaultTransactionType

    if (cosmosMsgPayload?.case === CosmosMsgType.MSG_TRANSFER_URL) {
      const { timeoutTimestamp } = cosmosMsgPayload.value
      if (timeoutTimestamp) {
        ;(
          result as ChainSpecificResolverInput<CosmosSpecific>
        ).timeoutTimestamp = timeoutTimestamp
      }
    }
    ;(result as ChainSpecificResolverInput<EthereumSpecific>).data =
      regular.transactionDetails.data
  }

  return result
}
