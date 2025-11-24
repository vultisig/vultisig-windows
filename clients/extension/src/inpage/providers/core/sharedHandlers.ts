import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { attempt, withFallback } from '@lib/utils/attempt'

import { requestAccount } from './requestAccount'

type SendTxInput = {
  from: string
  to: string
  value: string
  data: string
}

type TxInput = TransactionDetails | SendTxInput

// it's a temporary solution to handle shared requests before we completely migrate to the new communication layer
export const getSharedHandlers = (chain: Chain) => {
  return {
    get_accounts: async () =>
      withFallback(
        attempt(async () => {
          const { address } = await callBackground({
            getAccount: { chain },
          })

          return [address]
        }),
        []
      ),
    request_accounts: async () => {
      const { address } = await requestAccount(chain)

      return [address]
    },
    get_transaction_by_hash: async ([hash]: [string]) =>
      callBackground({
        getTx: { chain, hash },
      }),
    send_transaction: async ([tx]: [TxInput]) => {
      const getTransactionDetails = () => {
        if ('asset' in tx) {
          return tx
        }

        return {
          asset: {
            ticker: chainFeeCoin[chain].ticker,
          },
          from: tx.from,
          to: tx.to,
          amount: {
            amount: tx.value,
            decimals: chainFeeCoin[chain].decimals,
          },
          data: tx.data,
        }
      }

      const transactionDetails = getTransactionDetails()
      console.log('transactionDetails', transactionDetails)

      const { hash } = await callPopup(
        {
          sendTx: {
            keysign: {
              transactionDetails,
              chain,
            },
          },
        },
        {
          account: transactionDetails.from,
        }
      )

      return hash
    },
  } as const
}
