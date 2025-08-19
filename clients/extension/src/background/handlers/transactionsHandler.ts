import { storage } from '@core/extension/storage'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { v4 as uuidv4 } from 'uuid'

import { initializeMessenger } from '../../messengers/initializeMessenger'
import {
  addTransactionToVault,
  getVaultTransactions,
  removeTransactionFromVault,
  updateTransaction,
} from '../../transactions/state/transactions'
import { ITransaction } from '../../utils/interfaces'
import { getVaultIdByTransaction } from '../utils/getVaultIdByTransaction'
import { handleOpenPanel } from '../window/windowManager'

const popupMessenger = initializeMessenger({ connect: 'popup' })

export const handleSendTransaction = async (
  transaction: Pick<ITransaction, 'transactionPayload' | 'status'>
): Promise<ITransaction> => {
  const uuid = uuidv4()

  try {
    const currentVaultId =
      (await getVaultIdByTransaction(transaction)) ??
      shouldBePresent(await storage.getCurrentVaultId())

    await addTransactionToVault(currentVaultId, {
      ...transaction,
      id: uuid,
      status: 'default',
    })

    const createdWindowId = await handleOpenPanel({ id: 'transactionTab' })

    if (!createdWindowId) {
      throw new Error('Failed to open transaction panel window')
    }

    const updatedTx = shouldBePresent(
      (await getVaultTransactions(currentVaultId)).find(tx => tx.id === uuid)
    )

    await updateTransaction(currentVaultId, {
      ...updatedTx,
      windowId: createdWindowId,
    })

    return await new Promise<ITransaction>((resolve, reject) => {
      let isResolved = false
      const cleanUp = () => {
        chrome.windows.onRemoved.removeListener(onRemoved)
      }

      popupMessenger.reply(`tx_result_${uuid}`, (txResult: ITransaction) => {
        if (isResolved) return
        isResolved = true
        cleanUp()
        resolve({ ...txResult })
      })

      const onRemoved = async (closedWindowId: number) => {
        if (closedWindowId !== createdWindowId) return
        if (isResolved) return
        isResolved = true
        try {
          const currentTransactions = await getVaultTransactions(currentVaultId)
          const matchedTransaction = currentTransactions.find(
            ({ windowId }) => windowId === createdWindowId
          )

          if (!matchedTransaction) {
            reject(new Error('Transaction not found after window closed'))
            chrome.windows.onRemoved.removeListener(onRemoved)
            return
          }

          if (matchedTransaction.status === 'default') {
            // removing the transaction with default status from store
            removeTransactionFromVault(
              currentVaultId,
              shouldBePresent(matchedTransaction.id)
            )
            reject(new Error('Transaction was not completed'))
          } else {
            return matchedTransaction
          }
        } catch (err) {
          reject(err)
        } finally {
          cleanUp()
        }
      }

      chrome.windows.onRemoved.addListener(onRemoved)
    })
  } catch (err) {
    return Promise.reject(err)
  }
}
