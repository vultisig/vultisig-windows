import { getVaultId } from '@core/mpc/vault/Vault'
import {
  SerializedTransactionRecord,
  TransactionRecord,
} from '@core/ui/transaction-history/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { attempt } from '@lib/utils/attempt'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const initialTransactionRecords: SerializedTransactionRecord[] = []

type GetTransactionRecordsFunction = (
  vaultId: string
) => Promise<SerializedTransactionRecord[]>

type SaveTransactionRecordFunction = (
  record: SerializedTransactionRecord
) => Promise<void>

type UpdateTransactionRecordFunction = (
  record: SerializedTransactionRecord
) => Promise<void>

export type TransactionHistoryStorage = {
  getTransactionRecords: GetTransactionRecordsFunction
  saveTransactionRecord: SaveTransactionRecordFunction
  updateTransactionRecord: UpdateTransactionRecordFunction
}

const deserializeRecord = (
  record: SerializedTransactionRecord
): TransactionRecord => {
  const { data: parsedData, error } = attempt(() => JSON.parse(record.data))
  if (error) {
    throw new Error(`Failed to parse transaction data for record ${record.id}`)
  }

  return { ...record, data: parsedData } as TransactionRecord
}

const serializeRecord = (
  record: TransactionRecord
): SerializedTransactionRecord => ({
  ...record,
  data: JSON.stringify(record.data),
})

export const useTransactionRecordsQuery = () => {
  const { getTransactionRecords } = useCore()
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)

  return useQuery({
    queryKey: [StorageKey.transactionHistory, vaultId],
    queryFn: async () => {
      const records = await getTransactionRecords(vaultId)
      return records.map(deserializeRecord)
    },
    ...noRefetchQueryOptions,
  })
}

export const useSaveTransactionRecordMutation = () => {
  const { saveTransactionRecord } = useCore()
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async (record: TransactionRecord) => {
      await saveTransactionRecord(serializeRecord(record))
      await refetchQueries([StorageKey.transactionHistory, vaultId])
    },
  })
}

export const useUpdateTransactionRecordMutation = () => {
  const { updateTransactionRecord } = useCore()
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async (record: TransactionRecord) => {
      await updateTransactionRecord(serializeRecord(record))
      await refetchQueries([StorageKey.transactionHistory, vaultId])
    },
  })
}
