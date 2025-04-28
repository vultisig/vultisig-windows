import { Currency } from '@clients/extension/src/utils/constants'
import {
  AccountsProps,
  ChainProps,
  ITransaction,
  Vault,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Language } from '@core/ui/i18n/Language'

interface EthProviderState {
  accounts: string[]
  chainId: string
  chainKey: Chain
  isConnected: boolean
}

interface LocalStorage {
  accounts?: AccountsProps
  chains?: ChainProps[]
  currency?: Currency
  language?: Language
  vaults?: Vault[]
  isPriority?: boolean
  ethProviderState?: EthProviderState
  transactions?: ITransaction[]
}
type LocalStorageKeys = keyof LocalStorage

export const setStoredRequest = (accounts: AccountsProps): Promise<void> => {
  const vals: LocalStorage = { accounts }

  return new Promise(resolve => {
    chrome.storage.local.set(vals, () => {
      resolve()
    })
  })
}

export const getStoredChains = (): Promise<ChainProps[]> => {
  const keys: LocalStorageKeys[] = ['chains']

  return new Promise(resolve => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      if (res.chains?.length) {
        resolve(res.chains)
      } else {
        resolve([chainFeeCoin.Ethereum])
      }
    })
  })
}

export const setStoredChains = (chains: ChainProps[]): Promise<void> => {
  const vals: LocalStorage = { chains }

  return new Promise(resolve => {
    chrome.storage.local.set(vals, () => {
      resolve()
    })
  })
}

export const getStoredVaults = (): Promise<Vault[]> => {
  const keys: LocalStorageKeys[] = ['vaults']

  return new Promise(resolve => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.vaults ?? [])
    })
  })
}

export const setStoredVaults = (vaults: Vault[]): Promise<void> => {
  const vals: LocalStorage = { vaults }

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

export const getIsPriority = (): Promise<boolean> => {
  const keys: LocalStorageKeys[] = ['isPriority']
  return new Promise(resolve => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.isPriority ?? true)
    })
  })
}

export const setIsPriority = (isPriority: boolean): Promise<void> => {
  const vals: LocalStorage = { isPriority }

  return new Promise(resolve => {
    chrome.storage.local.set(vals, () => {
      resolve()
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
