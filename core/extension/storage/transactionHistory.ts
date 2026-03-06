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

type SetAllRecordsInput = {
  vaultId: string
  records: SerializedTransactionRecord[]
}

const setAllRecords = async ({ vaultId, records }: SetAllRecordsInput) =>
  setStorageValue(getRecordsKey(vaultId), records)

const writeQueueByVault = new Map<string, Promise<void>>()

const enqueueVaultWrite = async ({
  vaultId,
  task,
}: {
  vaultId: string
  task: () => Promise<void>
}) => {
  const previous = writeQueueByVault.get(vaultId) ?? Promise.resolve()
  const next = previous.then(task, task)
  writeQueueByVault.set(
    vaultId,
    next.finally(() => {
      if (writeQueueByVault.get(vaultId) === next) {
        writeQueueByVault.delete(vaultId)
      }
    })
  )
  await next
}

export const transactionHistoryStorage: TransactionHistoryStorage = {
  getTransactionRecords: getAllRecords,
  saveTransactionRecord: async record => {
    await enqueueVaultWrite({
      vaultId: record.vaultId,
      task: async () => {
        const records = await getAllRecords(record.vaultId)
        await setAllRecords({
          vaultId: record.vaultId,
          records: [...records, record],
        })
      },
    })
  },
  updateTransactionRecord: async record => {
    await enqueueVaultWrite({
      vaultId: record.vaultId,
      task: async () => {
        const records = await getAllRecords(record.vaultId)
        await setAllRecords({
          vaultId: record.vaultId,
          records: records.map(r => (r.id === record.id ? record : r)),
        })
      },
    })
  },
}
