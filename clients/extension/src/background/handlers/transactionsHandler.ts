import { Chain } from '@core/chain/Chain'
import { ITransaction, SendTransactionResponse } from '../../utils/interfaces'
import {
  getStoredTransactions,
  setStoredTransactions,
} from '../../utils/storage'
import { v4 as uuidv4 } from 'uuid'
import { appPaths } from '../../navigation'
import { handleOpenPanel } from '../window/windowManager'

export const handleSendTransaction = (
  transaction: ITransaction,
  chain: Chain
): Promise<SendTransactionResponse> => {
  return new Promise((resolve, reject) => {
    getStoredTransactions().then(transactions => {
      const uuid = uuidv4()

      setStoredTransactions([
        {
          ...transaction,
          chain,
          id: uuid,
          status: 'default',
        },
        ...transactions,
      ]).then(() => {
        handleOpenPanel(appPaths.transactionTab).then(createdWindowId => {
          getStoredTransactions().then(transactions => {
            setStoredTransactions(
              transactions.map(transaction =>
                transaction.id === uuid
                  ? { ...transaction, windowId: createdWindowId }
                  : transaction
              )
            )
          })

          chrome.windows.onRemoved.addListener(closedWindowId => {
            if (closedWindowId === createdWindowId) {
              getStoredTransactions().then(transactions => {
                const transaction = transactions.find(
                  ({ windowId }) => windowId === createdWindowId
                )

                if (transaction) {
                  if (transaction.status === 'default') {
                    getStoredTransactions().then(transactions => {
                      setStoredTransactions(
                        transactions.filter(
                          transaction =>
                            transaction.id !== uuid &&
                            transaction.windowId !== createdWindowId
                        )
                      ).then(reject)
                    })
                  } else {
                    if (transaction.customSignature) {
                      resolve({
                        txResponse: transaction.customSignature,
                        raw: transaction.raw,
                      })
                    } else if (transaction.txHash) {
                      resolve({
                        txResponse: transaction.txHash,
                        raw: transaction.raw,
                      })
                    } else {
                      reject()
                    }
                  }
                } else {
                  reject()
                }
              })
            }
          })
        })
      })
    })
  })
}
