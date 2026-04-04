import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleKeysignWsNotification } from './handleKeysignWsNotification'
import type { KeysignWsNotification } from './keysignNotificationWebSocket'
import { parseKeysignQrForNotificationBanner } from './parseKeysignQrForNotificationBanner'

vi.mock('./parseKeysignQrForNotificationBanner')

const baseMsg: KeysignWsNotification = {
  type: 'notification',
  id: 'n1',
  vault_name: 'Vault A',
  qr_code_data: 'vultisig://stub',
}

describe('handleKeysignWsNotification', () => {
  beforeEach(() => {
    vi.mocked(parseKeysignQrForNotificationBanner).mockReset()
  })

  it('does not show banner or OS notification for initiator share', async () => {
    vi.mocked(parseKeysignQrForNotificationBanner).mockResolvedValue({
      initiatorPartyId: 'Party-A',
      description: 'Send 1 ETH',
    })

    const showBanner = vi.fn()
    const showOsNotification = vi.fn()
    const bringAppToFront = vi.fn()
    const ws = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
    } as unknown as WebSocket

    await handleKeysignWsNotification({
      msg: baseMsg,
      ws,
      vaultId: 'vault-id',
      localPartyName: 'Party-A',
      t: ((k: string) => k) as any,
      topView: { id: 'vault' },
      vaultBannerMeta: new Map([['vault-id', { isFastVault: false }]]),
      navigateToKeysign: () => {},
      showBanner,
      bringAppToFront,
      showOsNotification,
    })

    expect(showBanner).not.toHaveBeenCalled()
    expect(showOsNotification).not.toHaveBeenCalled()
    expect(bringAppToFront).not.toHaveBeenCalled()
  })

  it('sends ack when socket is open', async () => {
    const send = vi.fn()
    const ws = { readyState: WebSocket.OPEN, send } as unknown as WebSocket

    await handleKeysignWsNotification({
      msg: baseMsg,
      ws,
      vaultId: 'vault-id',
      localPartyName: 'Party-B',
      t: ((k: string) => k) as any,
      topView: { id: 'vault' },
      vaultBannerMeta: new Map(),
      navigateToKeysign: () => {},
      showBanner: () => {},
    })

    expect(send).toHaveBeenCalledWith(JSON.stringify({ type: 'ack', id: 'n1' }))
  })

  it('does not show in-app banner on blocked view, but still acks', async () => {
    vi.mocked(parseKeysignQrForNotificationBanner).mockResolvedValue({
      initiatorPartyId: 'Party-A',
      description: 'Send 1 ETH',
    })

    const showBanner = vi.fn()
    const send = vi.fn()
    const ws = { readyState: WebSocket.OPEN, send } as unknown as WebSocket

    await handleKeysignWsNotification({
      msg: baseMsg,
      ws,
      vaultId: 'vault-id',
      localPartyName: 'Party-B',
      t: ((k: string) => k) as any,
      topView: { id: 'keysign' },
      vaultBannerMeta: new Map(),
      navigateToKeysign: () => {},
      showBanner,
    })

    expect(showBanner).not.toHaveBeenCalled()
    expect(send).toHaveBeenCalledWith(JSON.stringify({ type: 'ack', id: 'n1' }))
  })

  it('shows banner and OS notification for non-initiator on allowed view', async () => {
    vi.mocked(parseKeysignQrForNotificationBanner).mockResolvedValue({
      initiatorPartyId: 'Party-A',
      description: 'Send 1 ETH',
    })

    const showBanner = vi.fn()
    const showOsNotification = vi.fn()
    const bringAppToFront = vi.fn()
    const navigateToKeysign = vi.fn()
    const send = vi.fn()
    const ws = {
      readyState: WebSocket.OPEN,
      send,
    } as unknown as WebSocket

    await handleKeysignWsNotification({
      msg: baseMsg,
      ws,
      vaultId: 'vault-id',
      localPartyName: 'Party-B',
      t: ((k: string) => k) as any,
      topView: { id: 'vault' },
      vaultBannerMeta: new Map([['vault-id', { isFastVault: true }]]),
      navigateToKeysign,
      showBanner,
      bringAppToFront,
      showOsNotification,
    })

    expect(showBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Send 1 ETH',
        isFastVault: true,
        vaultName: 'Vault A',
      })
    )
    expect(showOsNotification).toHaveBeenCalled()
    expect(bringAppToFront).toHaveBeenCalled()
    expect(send).toHaveBeenCalledWith(JSON.stringify({ type: 'ack', id: 'n1' }))
  })
})
