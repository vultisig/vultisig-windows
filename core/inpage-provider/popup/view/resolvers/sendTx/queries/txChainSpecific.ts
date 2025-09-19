import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import {
  CosmosSpecific,
  EthereumSpecific,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { ParsedTx } from '../core/parsedTx'
import { CosmosMsgType, IKeysignTransactionPayload } from '../interfaces'

type Input = {
  coin: AccountCoin
  parsedTx: ParsedTx
  feeSettings: FeeSettings | null
}

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

export const getTxChainSpecificQuery = (input: Input) => ({
  queryKey: ['tx-chain-specific', input],
  queryFn: () => {
    const { coin, parsedTx, feeSettings } = input

    const amount = matchRecordUnion<ParsedTx, number>(parsedTx, {
      tx: ({ transactionDetails }) =>
        fromChainAmount(
          Number(transactionDetails.amount?.amount) || 0,
          coin.decimals
        ),
      solanaTx: ({ inAmount }) =>
        fromChainAmount(Number(inAmount) || 0, coin.decimals),
      psbt: psbt => {
        const { sendAmount } = getPsbtTransferInfo(psbt, coin.address)

        return fromChainAmount(Number(sendAmount) || 0, coin.decimals)
      },
    })

    const isDeposit = matchRecordUnion<ParsedTx, boolean>(parsedTx, {
      tx: ({ transactionDetails, isDeposit }) =>
        isDeposit ||
        transactionDetails.cosmosMsgPayload?.case ===
          CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
      solanaTx: () => false,
      psbt: () => false,
    })

    const receiver = matchRecordUnion<ParsedTx, string>(parsedTx, {
      tx: ({ transactionDetails }) => transactionDetails.to ?? '',
      solanaTx: parsed =>
        parsed.kind === 'transfer' ? (parsed.receiverAddress ?? '') : '',
      psbt: () => '',
    })

    const chainSpecificInput: ChainSpecificResolverInput = {
      coin,
      amount,
      isDeposit,
      receiver,
      feeSettings,
    }

    if ('psbt' in parsedTx) {
      chainSpecificInput.psbt = parsedTx.psbt
    }

    if ('tx' in parsedTx) {
      const { tx } = parsedTx
      chainSpecificInput.transactionType = getTxType(tx)
      if (
        tx.transactionDetails.cosmosMsgPayload?.case ===
        CosmosMsgType.MSG_TRANSFER_URL
      ) {
        const { timeoutTimestamp } =
          tx.transactionDetails.cosmosMsgPayload.value
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
        chainSpecificInput as ChainSpecificResolverInput<any, EthereumSpecific>
      ).data = parsedTx.tx.transactionDetails.data
    }

    return getChainSpecific(chainSpecificInput)
  },
})
