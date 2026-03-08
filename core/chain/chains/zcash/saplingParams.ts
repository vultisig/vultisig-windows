const spendParamsUrl = 'https://download.z.cash/downloads/sapling-spend.params'
const outputParamsUrl =
  'https://download.z.cash/downloads/sapling-output.params'
const dbName = 'zcash-params'
const storeName = 'params'

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const getFromCache = async (key: string): Promise<Uint8Array | null> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

const putInCache = async (key: string, data: Uint8Array): Promise<void> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.put(data, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

const fetchAndCache = async (url: string, key: string): Promise<Uint8Array> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()
  const data = new Uint8Array(buffer)
  await putInCache(key, data)
  return data
}

const loadParam = async (url: string, key: string): Promise<Uint8Array> => {
  const cached = await getFromCache(key)
  if (cached) {
    return cached
  }
  return fetchAndCache(url, key)
}

let paramsPromise: Promise<{ spend: Uint8Array; output: Uint8Array }> | null =
  null

export const loadSaplingParams = (): Promise<{
  spend: Uint8Array
  output: Uint8Array
}> => {
  if (!paramsPromise) {
    paramsPromise = Promise.all([
      loadParam(spendParamsUrl, 'sapling-spend'),
      loadParam(outputParamsUrl, 'sapling-output'),
    ]).then(([spend, output]) => ({ spend, output }))
  }
  return paramsPromise
}
