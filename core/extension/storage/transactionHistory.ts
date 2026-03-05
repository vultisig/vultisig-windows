import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  initialTransactionRecords,
  TransactionHistoryStorage,
} from '@core/ui/storage/transactionHistory'
import { SerializedTransactionRecord } from '@core/ui/transaction-history/core'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const getRecordsKey = (vaultId: string) =>
  `${StorageKey.transactionHistory}:${vaultId}`

const getAllRecords = async (
  vaultId: string
): Promise<SerializedTransactionRecord[]> =>
  getStorageValue(getRecordsKey(vaultId), initialTransactionRecords)

const setAllRecords = async (
  vaultId: string,
  records: SerializedTransactionRecord[]
) => setStorageValue(getRecordsKey(vaultId), records)

export const transactionHistoryStorage: TransactionHistoryStorage = {
  getTransactionRecords: getAllRecords,
  saveTransactionRecord: async record => {
    const records = await getAllRecords(record.vaultId)
    await setAllRecords(record.vaultId, [...records, record])
  },
  updateTransactionRecord: async record => {
    const records = await getAllRecords(record.vaultId)
    await setAllRecords(
      record.vaultId,
      records.map(r => (r.id === record.id ? record : r))
    )
  },
}
