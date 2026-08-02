import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it, vi } from 'vitest'

import {
  RefetchableKeysignPayloadQuery,
  refreshKeysignPayload,
} from './refreshKeysignPayload'

const payload = (memo: string) => ({ memo }) as KeysignPayload

const query = (result: {
  data?: KeysignPayload
  error?: unknown
}): RefetchableKeysignPayloadQuery<KeysignPayload> => ({
  refetch: () => Promise.resolve(result),
})

describe('refreshKeysignPayload', () => {
  it('returns the rebuilt payload, not the one the screen was holding', async () => {
    const rebuilt = payload('rebuilt at sign time')

    await expect(refreshKeysignPayload(query({ data: rebuilt }))).resolves.toBe(
      rebuilt
    )
  })

  it('rebuilds every time signing starts', async () => {
    const refetch = vi.fn(() => Promise.resolve({ data: payload('fresh') }))

    await refreshKeysignPayload({ refetch })

    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('throws when the rebuild fails, so the ceremony is abandoned', async () => {
    // A builder gate rejecting at sign time (queue disabled, chain halted)
    // arrives here as a query error. Signing the payload we already had is
    // exactly what must not happen.
    await expect(
      refreshKeysignPayload(
        query({ error: new Error('EnableAdvSwapQueue is disabled') })
      )
    ).rejects.toThrow('EnableAdvSwapQueue is disabled')
  })

  it('throws on an error even when stale data is returned alongside it', async () => {
    // React Query hands back the last good data next to the error; that data is
    // precisely the payload whose freshness is in doubt.
    await expect(
      refreshKeysignPayload(
        query({
          data: payload('stale'),
          error: new Error('inbound vault churned'),
        })
      )
    ).rejects.toThrow('inbound vault churned')
  })

  it('throws when the rebuild yields no payload', async () => {
    await expect(refreshKeysignPayload(query({}))).rejects.toThrow(
      'Keysign payload could not be rebuilt'
    )
  })

  it('propagates a rejected refetch rather than swallowing it', async () => {
    await expect(
      refreshKeysignPayload<KeysignPayload>({
        refetch: () => Promise.reject(new Error('network down')),
      })
    ).rejects.toThrow('network down')
  })
})
