import { queriesPersisterKey } from '@core/ui/storage/queriesPersister'
import { getStorageValue } from '@lib/extension/storage/get'
import { removeStorageValue } from '@lib/extension/storage/remove'
import { setStorageValue } from '@lib/extension/storage/set'
import { Persister } from '@tanstack/react-query-persist-client'

const serialize = (data: unknown) =>
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
    await setStorageValue(queriesPersisterKey, serialize(value))
  },
  restoreClient: async () => {
    const value = await getStorageValue<unknown>(queriesPersisterKey, undefined)

    if (typeof value === 'string') {
      return deserialize(value)
    }

    return value
  },
  removeClient: () => removeStorageValue(queriesPersisterKey),
}
