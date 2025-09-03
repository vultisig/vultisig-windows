import { Chain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { attempt, withFallback } from '@lib/utils/attempt'

import { requestAccount } from './requestAccount'

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
    send_transaction: async ([tx]: [TransactionDetails]) => {
      console.log('send_transaction', tx)
      const { hash } = await callPopup(
        {
          sendTx: {
            keysign: {
              transactionDetails: tx,
              chain,
            },
          },
        },
        {
          account: tx.from,
        }
      )

      return hash
    },
  } as const
}
