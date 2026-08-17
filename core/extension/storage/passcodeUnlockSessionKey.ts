const databaseName = 'vultisig-passcode-unlock-session'
const storeName = 'keys'
const recordKey = 'unlockSessionKey'
const databaseVersion = 1

const keyAlgorithm = { name: 'AES-GCM', length: 256 } as const
const keyUsages: KeyUsage[] = ['encrypt', 'decrypt']

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion)

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('indexedDB open blocked'))
  })

const readRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const loadPersistedKey = async (): Promise<CryptoKey> => {
  const db = await openDatabase()

  try {
    const stored = await readRequest(
      db
        .transaction(storeName, 'readonly')
        .objectStore(storeName)
        .get(recordKey)
    )

    if (stored instanceof CryptoKey) {
      return stored
    }

    const key = await crypto.subtle.generateKey(keyAlgorithm, false, keyUsages)

    await readRequest(
      db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName)
        .put(key, recordKey)
    )

    return key
  } finally {
    db.close()
  }
}

let keyPromise: Promise<CryptoKey> | null = null

/**
 * The non-extractable AES-GCM key that seals the persisted unlock session.
 *
 * Kept in IndexedDB so it survives a popup teardown while staying unreadable:
 * `extractable: false` means no code in the extension — nor anything reading the
 * stored record — can recover the raw key bytes. Where IndexedDB is unavailable
 * the key is generated per context instead, which degrades the feature to "the
 * user re-enters the passcode after the popup closes" rather than falling back
 * to storing the passcode in the clear.
 */
export const getPasscodeUnlockSessionKey = (): Promise<CryptoKey> => {
  if (!keyPromise) {
    keyPromise =
      typeof indexedDB === 'undefined'
        ? crypto.subtle.generateKey(keyAlgorithm, false, keyUsages)
        : loadPersistedKey().catch(() =>
            crypto.subtle.generateKey(keyAlgorithm, false, keyUsages)
          )
  }

  return keyPromise
}
