import { Chain } from '@core/chain/Chain'
import { v4 as uuidv4 } from 'uuid'

import { ITransaction } from '../../utils/interfaces'
import {
  getStoredTransactions,
  setStoredTransactions,
} from '../../utils/storage'
import { handleOpenPanel } from '../window/windowManager'
import { ExecuteTxResultWithEncoded } from '@core/chain/tx/execute/ExecuteTxResolver'

export const handleSendTransaction = async (
  transaction: ITransaction
): Promise<ExecuteTxResultWithEncoded> => {
  const uuid = uuidv4()

  try {
    const transactions = await getStoredTransactions()

    await setStoredTransactions([
      {
        ...transaction,
        id: uuid,
        status: 'default',
      },
      ...transactions,
    ])

    const createdWindowId = await handleOpenPanel({ id: 'transactionTab' })

    if (!createdWindowId) {
      throw new Error('Failed to open transaction panel window')
    }

    const updatedTransactions = await getStoredTransactions()
    await setStoredTransactions(
      updatedTransactions.map(t =>
        t.id === uuid ? { ...t, windowId: createdWindowId } : t
      )
    )

    return await new Promise<ExecuteTxResultWithEncoded>((resolve, reject) => {
      const onRemoved = async (closedWindowId: number) => {
        if (closedWindowId !== createdWindowId) return

        try {
          const currentTransactions = await getStoredTransactions()
          const matchedTransaction = currentTransactions.find(
            ({ windowId }) => windowId === createdWindowId
          )

          if (!matchedTransaction) {
            reject(new Error('Transaction not found after window closed'))
            chrome.windows.onRemoved.removeListener(onRemoved)
            return
          }

          if (matchedTransaction.status === 'default') {
            const filteredTransactions = currentTransactions.filter(
              t => t.id !== uuid && t.windowId !== createdWindowId
            )
            await setStoredTransactions(filteredTransactions)
            reject(new Error('Transaction was not completed'))
          } else {
            if (matchedTransaction.txHash) {
              resolve({
                txHash: matchedTransaction.txHash,
                encoded: matchedTransaction.encoded ?? undefined,
              })
            } else {
              reject(new Error('Transaction has no signature or hash'))
            }
          }
        } catch (err) {
          reject(err)
        } finally {
          chrome.windows.onRemoved.removeListener(onRemoved)
        }
      }

      chrome.windows.onRemoved.addListener(onRemoved)
    })
  } catch (err) {
    return Promise.reject(err)
  }
}
