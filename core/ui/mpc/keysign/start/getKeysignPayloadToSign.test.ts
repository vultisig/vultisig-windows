import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it, vi } from 'vitest'

import { getKeysignPayloadToSign } from './getKeysignPayloadToSign'
import { RefetchableKeysignPayloadQuery } from './refreshKeysignPayload'

const payload = (memo: string) => ({ memo }) as KeysignPayload

const query = (result: {
  data?: KeysignPayload
  error?: unknown
}): RefetchableKeysignPayloadQuery<KeysignPayload> => ({
  refetch: () => Promise.resolve(result),
})

const toKeysignPayload = (keysign: KeysignPayload) => ({ keysign })

describe('getKeysignPayloadToSign', () => {
  it('hands the ceremony the rebuilt payload', async () => {
    const rebuilt = payload('rebuilt at sign time')

    await expect(
      getKeysignPayloadToSign({
        query: query({ data: rebuilt }),
        toKeysignPayload,
        onError: vi.fn(),
      })
    ).resolves.toEqual({ keysign: rebuilt })
  })

  it('refuses to sign when the rebuild fails', async () => {
    // Never the payload the review screen was holding: a gate rejecting now is
    // exactly when signing the mount-time payload would be wrong.
    await expect(
      getKeysignPayloadToSign({
        query: query({
          data: payload('stale'),
          error: new Error('THORChain trading is halted for ETH'),
        }),
        toKeysignPayload,
        onError: vi.fn(),
      })
    ).resolves.toBeNull()
  })

  it('reports why signing was refused', async () => {
    const onError = vi.fn()

    await getKeysignPayloadToSign({
      query: query({ error: new Error('quote expired') }),
      toKeysignPayload,
      onError,
    })

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('quote expired')
    )
  })

  it('refuses to sign when the rebuild yields nothing', async () => {
    await expect(
      getKeysignPayloadToSign({
        query: query({}),
        toKeysignPayload,
        onError: vi.fn(),
      })
    ).resolves.toBeNull()
  })

  it('refuses to sign when the rebuild throws', async () => {
    const onError = vi.fn()

    await expect(
      getKeysignPayloadToSign<KeysignPayload>({
        query: { refetch: () => Promise.reject(new Error('offline')) },
        toKeysignPayload,
        onError,
      })
    ).resolves.toBeNull()

    expect(onError).toHaveBeenCalled()
  })

  it('refuses to sign when the conversion throws', async () => {
    // Callers await this in a click handler, so a rejection here would be
    // unhandled: the button would do nothing, silently.
    const onError = vi.fn()

    await expect(
      getKeysignPayloadToSign({
        query: query({ data: payload('ok') }),
        toKeysignPayload: () => {
          throw new Error('cannot convert payload')
        },
        onError,
      })
    ).resolves.toBeNull()

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('cannot convert payload')
    )
  })

  it('does not report an error on success', async () => {
    const onError = vi.fn()

    await getKeysignPayloadToSign({
      query: query({ data: payload('ok') }),
      toKeysignPayload,
      onError,
    })

    expect(onError).not.toHaveBeenCalled()
  })
})
