import { Currency } from '@clients/extension/src/utils/constants'
import {
  AccountsProps,
  ChainProps,
  ITransaction,
  VaultProps,
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

export interface LocalStorage {
  accounts?: AccountsProps
  chains?: ChainProps[]
  currency?: Currency
  language?: Language
  vaults?: VaultProps[]
  isPriority?: boolean
  ethProviderState?: EthProviderState
  transactions?: ITransaction[]
}
export type LocalStorageKeys = keyof LocalStorage

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

export const getStoredChains = (): Promise<ChainProps[]> => {
  const keys: LocalStorageKeys[] = ['chains']

  return new Promise(resolve => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      if (res.chains?.length) {
        resolve(res.chains)
      } else {
        const defaultChain = chainFeeCoin.Ethereum

        resolve(defaultChain ? [{ ...defaultChain, active: true }] : [])
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

export const getStoredCurrency = (): Promise<Currency> => {
  const keys: LocalStorageKeys[] = ['currency']

  return new Promise(resolve => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.currency ?? Currency.USD)
    })
  })
}

export const setStoredCurrency = (currency: Currency): Promise<void> => {
  const vals: LocalStorage = { currency }

  return new Promise(resolve => {
    chrome.storage.local.set(vals, () => {
      resolve()
    })
  })
}

export const setStoredLanguage = (language: Language): Promise<void> => {
  const vals: LocalStorage = { language }

  return new Promise(resolve => {
    chrome.storage.local.set(vals, () => {
      resolve()
    })
  })
}

export const getStoredVaults = (): Promise<VaultProps[]> => {
  const keys: LocalStorageKeys[] = ['vaults']

  return new Promise(resolve => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.vaults ?? [])
    })
  })
}

export const setStoredVaults = (vaults: VaultProps[]): Promise<void> => {
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

export const getStoredEthProviderState = (): Promise<EthProviderState> => {
  const keys: LocalStorageKeys[] = ['ethProviderState']

  return new Promise(resolve => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(
        res.ethProviderState ?? {
          accounts: [],
          chainId: '0x1',
          chainKey: Chain.Ethereum,
          isConnected: false,
        }
      )
    })
  })
}

export const setStoredEthProviderState = (
  ethProviderState: EthProviderState
): Promise<void> => {
  const vals: LocalStorage = { ethProviderState }

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
