import { Chain } from '@vultisig/core-chain/Chain'
import { assertNativeSwapReadyForBroadcast } from '@vultisig/core-mpc/keysign/swap/assertNativeSwapReadyForBroadcast'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { assertReadyToBroadcast } from './assertReadyToBroadcast'
import { BroadcastError } from './broadcastKeysignTx'

vi.mock(
  '@vultisig/core-mpc/keysign/swap/assertNativeSwapReadyForBroadcast',
  () => ({
    assertNativeSwapReadyForBroadcast: vi.fn(),
  })
)

const input = {
  chain: Chain.Ethereum,
  keysignPayload: {} as KeysignPayload,
}

describe('assertReadyToBroadcast', () => {
  beforeEach(() => {
    vi.mocked(assertNativeSwapReadyForBroadcast).mockReset()
  })

  it('lets a still-valid swap through', async () => {
    vi.mocked(assertNativeSwapReadyForBroadcast).mockResolvedValue(undefined)

    await expect(assertReadyToBroadcast(input)).resolves.toBeUndefined()
  })

  it('refuses to broadcast when the guard rejects', async () => {
    vi.mocked(assertNativeSwapReadyForBroadcast).mockRejectedValue(
      new Error('THORChain trading is halted for ETH')
    )

    await expect(assertReadyToBroadcast(input)).rejects.toThrow()
  })

  it('reports the refusal as a broadcast failure, not a signing one', async () => {
    // Signing already succeeded by this point, so the generic branch's
    // device/timeout copy would be actively misleading.
    vi.mocked(assertNativeSwapReadyForBroadcast).mockRejectedValue(
      new Error('inbound vault address changed')
    )

    await expect(assertReadyToBroadcast(input)).rejects.toBeInstanceOf(
      BroadcastError
    )
  })

  it('keeps the reason the guard gave', async () => {
    vi.mocked(assertNativeSwapReadyForBroadcast).mockRejectedValue(
      new Error('Native swap quote is expired')
    )

    await expect(assertReadyToBroadcast(input)).rejects.toThrow(
      'Native swap quote is expired'
    )
  })

  it('checks the payload it is about to broadcast', async () => {
    vi.mocked(assertNativeSwapReadyForBroadcast).mockResolvedValue(undefined)

    await assertReadyToBroadcast(input)

    expect(assertNativeSwapReadyForBroadcast).toHaveBeenCalledWith(input)
  })
})
