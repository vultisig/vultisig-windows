import { queriesPersister } from '@core/extension/storage/queriesPersister'
import { queriesPersisterKey } from '@core/ui/storage/queriesPersister'
import { describe, expect, it } from 'vitest'

describe('extension queriesPersister', () => {
  it('persists and restores bigint values through chrome storage', async () => {
    const client = {
      timestamp: 1,
      buster: 'v3',
      clientState: {
        queries: [
          {
            queryKey: ['coinBalance', { chain: 'Bittensor' }],
            state: {
              data: {
                'Bittensor:5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM':
                  723598828n,
              },
            },
          },
        ],
        mutations: [],
      },
    }

    await queriesPersister.persistClient(client)

    const stored = await chrome.storage.local.get(queriesPersisterKey)
    expect(typeof stored[queriesPersisterKey]).toBe('string')

    await expect(queriesPersister.restoreClient()).resolves.toEqual(client)
  })

  it('can restore previously stored object values', async () => {
    const legacyClient = {
      timestamp: 1,
      buster: 'v3',
      clientState: { queries: [], mutations: [] },
    }

    await chrome.storage.local.set({ [queriesPersisterKey]: legacyClient })

    await expect(queriesPersister.restoreClient()).resolves.toEqual(
      legacyClient
    )
  })
})
