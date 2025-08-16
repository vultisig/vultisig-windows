import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

import { ITransaction } from '../../utils/interfaces'

export const transactionsQueryKey = ['transactions']
const [key] = transactionsQueryKey

type VaultsTransactions = Record<string, ITransaction[]>

export const getVaultsTransactions = async (): Promise<VaultsTransactions> => {
  return getStorageValue<VaultsTransactions>(key, {})
}

export const setVaultsTransactions = async (
  transactions: VaultsTransactions
): Promise<void> => {
  await setStorageValue(key, transactions)
}

export const getVaultTransactions = async (
  vaultId: string
): Promise<ITransaction[]> => {
  const all = await getVaultsTransactions()
  return all[vaultId] ?? []
}

export const updateTransaction = async (
  vaultId: string,
  updated: ITransaction
): Promise<ITransaction[]> => {
  const all = await getVaultsTransactions()
  const vaultTxs = all[vaultId] ?? []
  const updatedList = vaultTxs.map(tx => (tx.id === updated.id ? updated : tx))

  const updatedAll = {
    ...all,
    [vaultId]: updatedList,
  }

  await setVaultsTransactions(updatedAll)
  return updatedList
}

export const addTransactionToVault = async (
  vaultId: string,
  transaction: ITransaction
): Promise<ITransaction[]> => {
  const allTransactions = await getVaultsTransactions()
  const vaultTransactions = allTransactions[vaultId] ?? []

  const alreadyExists = vaultTransactions.some(tx => tx.id === transaction.id)

  const updatedVaultTransactions = alreadyExists
    ? vaultTransactions
    : [...vaultTransactions, transaction]

  const updatedAll = {
    ...allTransactions,
    [vaultId]: updatedVaultTransactions,
  }

  await setVaultsTransactions(updatedAll)
  return updatedVaultTransactions
}

export const removeTransactionFromVault = async (
  vaultId: string,
  transactionId: string
): Promise<void> => {
  const all = await getVaultsTransactions()
  const vaultTxs = all[vaultId] ?? []

  const updatedVaultTxs = vaultTxs.filter(tx => tx.id !== transactionId)

  const updatedAll = {
    ...all,
    [vaultId]: updatedVaultTxs,
  }

  await setVaultsTransactions(updatedAll)
}
