import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  addPopupViewCall,
  getPopupViewCall,
  removePopupViewCall,
} from './calls'

const entryFor = (pluginId: string) => ({
  call: {
    pluginReshare: { pluginId, dAppSessionId: 'session', encryptionKeyHex: '' },
  },
})

beforeEach(() => {
  const store: Record<string, unknown> = {}
  // Every storage call yields before it touches the store, the way the real
  // asynchronous API does, so overlapping read-modify-writes can interleave.
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: async (key: string) => {
          const value = structuredClone(store[key])
          await Promise.resolve()
          return { [key]: value }
        },
        set: async (items: Record<string, unknown>) => {
          await Promise.resolve()
          Object.assign(store, structuredClone(items))
        },
        remove: async (key: string) => {
          await Promise.resolve()
          delete store[key]
        },
      },
    },
  })
})

describe('popup view calls', () => {
  it('keeps every call when several are added in parallel', async () => {
    const pluginIds = ['a', 'b', 'c']

    const ids = await Promise.all(
      pluginIds.map(pluginId => addPopupViewCall(entryFor(pluginId)))
    )

    const entries = await Promise.all(ids.map(getPopupViewCall))
    expect(entries).toEqual(pluginIds.map(entryFor))
  })

  it('keeps a call added while another one is being removed', async () => {
    const loadedId = await addPopupViewCall(entryFor('a'))

    const [addedId] = await Promise.all([
      addPopupViewCall(entryFor('b')),
      removePopupViewCall(loadedId),
    ])

    expect(await getPopupViewCall(loadedId)).toBeUndefined()
    expect(await getPopupViewCall(addedId)).toEqual(entryFor('b'))
  })
})
