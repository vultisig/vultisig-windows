import { queriesPersisterKey } from '@core/ui/storage/queriesPersister'
import { Persister } from '@tanstack/react-query-persist-client'

const serialize = (data: any) =>
  JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() + 'n' : value
  )

const deserialize = (json: string) =>
  JSON.parse(json, (_, value) => {
    if (typeof value === 'string' && /^\d+n$/.test(value)) {
      return BigInt(value.substring(0, value.length - 1))
    }
    return value
  })

export const queriesPersister: Persister = {
  persistClient: async value => {
    localStorage.setItem(queriesPersisterKey, serialize(value))
  },

  restoreClient: async () => {
    const value = localStorage.getItem(queriesPersisterKey)
    return value ? deserialize(value) : undefined
  },

  removeClient: async () => {
    localStorage.removeItem(queriesPersisterKey)
  },
}
