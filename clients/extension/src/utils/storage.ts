import { Currency } from '@clients/extension/src/utils/constants'
import {
  AccountsProps,
  ITransaction,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import { Language } from '@core/ui/i18n/Language'

interface EthProviderState {
  accounts: string[]
  chainId: string
  chainKey: Chain
  isConnected: boolean
}

interface LocalStorage {
  accounts?: AccountsProps
  currency?: Currency
  language?: Language
  isPriority?: boolean
  ethProviderState?: EthProviderState
  transactions?: ITransaction[]
}
type LocalStorageKeys = keyof LocalStorage

export const getStoredRequest = (): Promise<AccountsProps> => {
  const keys: LocalStorageKeys[] = ['accounts']

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      if (res.accounts) {
        resolve(res.accounts)
      } else {
        reject(new Error('No accounts found'))
      }
    })
  })
}

export const setStoredRequest = (accounts: AccountsProps): Promise<void> => {
  const vals: LocalStorage = { accounts }

  return new Promise(resolve => {
    chrome.storage.local.set(vals, () => {
      resolve()
    })
  })
}

export const setStoredTransaction = (
  transaction: ITransaction
): Promise<void> => {
  return new Promise(resolve => {
    getStoredTransactions().then(transactions => {
      setStoredTransactions(
        transactions.map(tx => (tx.id === transaction.id ? transaction : tx))
      ).then(resolve)
    })
  })
}

export const getStoredTransactions = (): Promise<ITransaction[]> => {
  const keys: LocalStorageKeys[] = ['transactions']

  return new Promise(resolve => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.transactions ?? [])
    })
  })
}

export const setStoredTransactions = (
  transactions: ITransaction[]
): Promise<void> => {
  const vals: LocalStorage = { transactions }

  return new Promise(resolve => {
    chrome.storage.local.set(vals, () => {
      resolve()
    })
  })
}
