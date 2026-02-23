import type { CoreStorage } from '@core/ui/storage/CoreStorage'

let storage: CoreStorage | null = null

export const setStorageContext = (ctx: CoreStorage | null) => {
  storage = ctx
}

export const getStorageContext = (): CoreStorage => {
  if (!storage) throw new Error('Storage context not initialized')
  return storage
}
