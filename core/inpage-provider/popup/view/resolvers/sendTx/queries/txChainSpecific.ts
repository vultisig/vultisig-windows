import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import {
  CosmosSpecific,
  EthereumSpecific,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useQuery } from '@tanstack/react-query'

import { CustomTxData } from '../core/customTxData'
import { ParsedTx } from '../core/parsedTx'
import { CosmosMsgType, IKeysignTransactionPayload } from '../interfaces'

const getTxType = (
  transaction: IKeysignTransactionPayload
): TransactionType => {
  if (transaction.transactionDetails.cosmosMsgPayload) {
    const msg = transaction.transactionDetails.cosmosMsgPayload
    return match(msg.case, {
      [CosmosMsgType.MSG_SEND]: () => TransactionType.UNSPECIFIED,
      [CosmosMsgType.THORCHAIN_MSG_SEND]: () => TransactionType.UNSPECIFIED,
      [CosmosMsgType.MSG_SEND_URL]: () => TransactionType.UNSPECIFIED,
      [CosmosMsgType.MSG_TRANSFER_URL]: () => TransactionType.IBC_TRANSFER,
      [CosmosMsgType.MSG_EXECUTE_CONTRACT]: () =>
        TransactionType.GENERIC_CONTRACT,
      [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: () =>
        TransactionType.GENERIC_CONTRACT,
      [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: () => TransactionType.UNSPECIFIED,
    })
  }
  return TransactionType.UNSPECIFIED
}

export const useChainSpecificQuery = (input: ParsedTx) => {
  return useQuery({
    queryKey: ['tx-chain-specific', input],
    queryFn: () => {
      const { coin, customTxData, feeSettings } = input

      const amount = matchRecordUnion<CustomTxData, number>(customTxData, {
        regular: ({ transactionDetails }) =>
          fromChainAmount(
            Number(transactionDetails.amount?.amount) || 0,
            coin.decimals
          ),
        solanaTx: solanaTx =>
          matchRecordUnion(solanaTx, {
            swap: ({ inAmount }) => {
              return fromChainAmount(Number(inAmount) || 0, coin.decimals)
            },
            transfer: ({ inAmount }) => {
              return fromChainAmount(Number(inAmount) || 0, coin.decimals)
            },
          }),
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
        solanaTx: () => false,
        psbt: () => false,
      })

      const receiver = matchRecordUnion<CustomTxData, string>(customTxData, {
        regular: ({ transactionDetails }) => transactionDetails.to ?? '',
        solanaTx: solanaTx =>
          matchRecordUnion(solanaTx, {
            swap: ({ authority }) => authority,
            transfer: ({ receiverAddress }) => receiverAddress,
          }),
        psbt: () => '',
      })

      const chainSpecificInput: ChainSpecificResolverInput = {
        coin,
        amount,
        isDeposit,
        receiver,
        feeSettings,
      }

      if ('psbt' in customTxData) {
        chainSpecificInput.psbt = customTxData.psbt
      }

      if ('regular' in customTxData) {
        const { regular } = customTxData
        chainSpecificInput.transactionType = getTxType(regular)
        if (
          regular.transactionDetails.cosmosMsgPayload?.case ===
          CosmosMsgType.MSG_TRANSFER_URL
        ) {
          const { timeoutTimestamp } =
            regular.transactionDetails.cosmosMsgPayload.value
          if (timeoutTimestamp) {
            ;(
              chainSpecificInput as ChainSpecificResolverInput<
                any,
                CosmosSpecific
              >
            ).timeoutTimestamp = timeoutTimestamp
          }
        }
        ;(
          chainSpecificInput as ChainSpecificResolverInput<
            any,
            EthereumSpecific
          >
        ).data = regular.transactionDetails.data
      }

      return getChainSpecific(chainSpecificInput)
    },
    ...noRefetchQueryOptions,
    retry: false,
  })
}
