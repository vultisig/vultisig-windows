import { Chain } from '@core/chain/Chain'
import { assertChainField } from '@core/chain/utils/assertChainField'
import {
  initialTransactionRecords,
  TransactionHistoryStorage,
} from '@core/ui/storage/transactionHistory'
import {
  SerializedTransactionRecord,
  TransactionRecordStatus,
  transactionRecordStatuses,
  TransactionRecordType,
  transactionRecordTypes,
} from '@core/ui/transaction-history/core'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { storage } from '../../wailsjs/go/models'
import {
  GetTransactionRecords,
  SaveTransactionRecord,
  UpdateTransactionRecord,
} from '../../wailsjs/go/storage/Store'

const assertTransactionRecordType = (value: string): TransactionRecordType => {
  if (!isOneOf(value, transactionRecordTypes)) {
    throw new Error(`Expected valid transaction record type, got ${value}`)
  }
  return value
}

const assertTransactionRecordStatus = (
  value: string
): TransactionRecordStatus => {
  if (!isOneOf(value, transactionRecordStatuses)) {
    throw new Error(`Expected valid transaction record status, got ${value}`)
  }
  return value
}

const toSerialized = (
  record: storage.TransactionRecord
): SerializedTransactionRecord => {
  const { chain } = assertChainField<Chain, { chain: string }>(record)

  return {
    id: record.id,
    vaultId: record.vault_id,
    type: assertTransactionRecordType(record.type),
    status: assertTransactionRecordStatus(record.status),
    chain,
    timestamp: record.timestamp,
    txHash: record.tx_hash,
    explorerUrl: record.explorer_url,
    fiatValue: record.fiat_value,
    data: record.data,
  }
}

const toWails = (
  record: SerializedTransactionRecord
): storage.TransactionRecord => {
  const wailsRecord = new storage.TransactionRecord()
  wailsRecord.id = record.id
  wailsRecord.vault_id = record.vaultId
  wailsRecord.type = record.type
  wailsRecord.status = record.status
  wailsRecord.chain = record.chain
  wailsRecord.timestamp = record.timestamp
  wailsRecord.tx_hash = record.txHash
  wailsRecord.explorer_url = record.explorerUrl
  wailsRecord.fiat_value = record.fiatValue
  wailsRecord.data = record.data
  return wailsRecord
}

export const transactionHistoryStorage: TransactionHistoryStorage = {
  getTransactionRecords: async vaultId => {
    const records =
      (await GetTransactionRecords(vaultId)) ?? initialTransactionRecords
    return records.map(toSerialized)
  },
  saveTransactionRecord: async record => {
    await SaveTransactionRecord(toWails(record))
  },
  updateTransactionRecord: async record => {
    await UpdateTransactionRecord(toWails(record))
  },
}
