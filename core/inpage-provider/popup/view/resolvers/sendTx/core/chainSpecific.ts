import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import {
  CosmosSpecific,
  EthereumSpecific,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

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

  const amount = matchRecordUnion<CustomTxData, number>(customTxData, {
    regular: ({ transactionDetails }) =>
      fromChainAmount(
        Number(transactionDetails.amount?.amount) || 0,
        coin.decimals
      ),
    solanaSwap: ({ inAmount }) =>
      fromChainAmount(Number(inAmount) || 0, coin.decimals),
    psbt: psbt => {
      const { sendAmount } = getPsbtTransferInfo(psbt, coin.address)

      return fromChainAmount(Number(sendAmount) || 0, coin.decimals)
    },
  })

  const isDeposit = matchRecordUnion<CustomTxData, boolean>(customTxData, {
    regular: ({ transactionDetails, isDeposit }) =>
      isDeposit ||
      transactionDetails.cosmosMsgPayload?.case ===
        CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
    solanaSwap: () => false,
    psbt: () => false,
  })

  const receiver = matchRecordUnion<CustomTxData, string>(customTxData, {
    regular: ({ transactionDetails }) => transactionDetails.to ?? '',
    solanaSwap: ({ authority }) => authority,
    psbt: () => '',
  })

  const result: ChainSpecificResolverInput = {
    coin,
    amount,
    isDeposit,
    receiver,
    feeSettings,
  }

  if ('psbt' in customTxData) {
    result.psbt = customTxData.psbt
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
          result as ChainSpecificResolverInput<any, CosmosSpecific>
        ).timeoutTimestamp = timeoutTimestamp
      }
    }
    ;(result as ChainSpecificResolverInput<any, EthereumSpecific>).data =
      regular.transactionDetails.data
  }

  return result
}
