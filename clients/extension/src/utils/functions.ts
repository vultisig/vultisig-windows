import { VersionedTransaction } from '@solana/web3.js'

export const isPopupView = () => {
  return chrome?.extension?.getViews({ type: 'popup' }).length > 0
}

export function isVersionedTransaction(tx: any): tx is VersionedTransaction {
  return (
    typeof tx === 'object' &&
    'version' in tx &&
    typeof tx.version === 'number' &&
    'message' in tx &&
    'addressTableLookups' in tx.message
  )
}

export const bytesEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  return arraysEqual(a, b)
}

type Indexed<T> = {
  length: number
  [index: number]: T
}

const arraysEqual = <T>(a: Indexed<T>, b: Indexed<T>): boolean => {
  if (a === b) return true

  const length = a.length
  if (length !== b.length) return false

  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}
