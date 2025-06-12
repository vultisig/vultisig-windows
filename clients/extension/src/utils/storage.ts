import { AccountsProps } from '@clients/extension/src/utils/interfaces'

type LocalStorage = {
  accounts?: AccountsProps
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
