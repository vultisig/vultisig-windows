import { BackgroundError } from '@core/inpage-provider/background/error'
import { PopupError } from '@core/inpage-provider/popup/error'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// We need to mock callBackground and callPopup before importing requestAccount
const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

import { requestAccount } from '@clients/extension/src/inpage/providers/core/requestAccount'
// We need to know the Chain enum value for Solana
import { Chain } from '@vultisig/core-chain/Chain'

describe('requestAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns account data when callBackground succeeds', async () => {
    const accountData = { address: '0x1234567890abcdef' }
    mockCallBackground.mockResolvedValue(accountData)

    const result = await requestAccount(Chain.Ethereum)

    expect(result).toEqual(accountData)
    expect(mockCallBackground).toHaveBeenCalledWith({
      getAccount: { chain: Chain.Ethereum },
    })
    // callPopup should NOT be called on success
    expect(mockCallPopup).not.toHaveBeenCalled()
  })

  it('falls through to popup on BackgroundError.Unauthorized, then retries', async () => {
    const accountData = { address: '0xABCDEF' }
    const appSession = {
      vaultId: 'v1',
      host: 'example.com',
      url: 'https://example.com',
    }

    // First call: background rejects with Unauthorized
    mockCallBackground
      .mockRejectedValueOnce(BackgroundError.Unauthorized)
      // Second call after popup grants access: succeeds
      .mockResolvedValueOnce(accountData)

    // Popup grants vault access and returns appSession
    mockCallPopup.mockResolvedValue({ appSession })

    const result = await requestAccount(Chain.Ethereum)

    expect(result).toEqual(accountData)

    // Background should be called twice
    expect(mockCallBackground).toHaveBeenCalledTimes(2)

    // Popup should be called with grantVaultAccess (including chain)
    expect(mockCallPopup).toHaveBeenCalledWith({
      grantVaultAccess: {
        preselectFastVault: undefined,
        chain: Chain.Ethereum,
      },
    })
  })

  it('passes preselectFastVault option to popup', async () => {
    const appSession = {
      vaultId: 'v1',
      host: 'example.com',
      url: 'https://example.com',
    }
    mockCallBackground
      .mockRejectedValueOnce(BackgroundError.Unauthorized)
      .mockResolvedValueOnce({ address: '0x123' })

    mockCallPopup.mockResolvedValue({ appSession })

    await requestAccount(Chain.Ethereum, { preselectFastVault: true })

    expect(mockCallPopup).toHaveBeenCalledWith({
      grantVaultAccess: {
        preselectFastVault: true,
        chain: Chain.Ethereum,
      },
    })
  })

  it('opens the popup when the initial getAccount fails with a bridge transport error', async () => {
    const appSession = {
      vaultId: 'v1',
      host: 'example.com',
      url: 'https://example.com',
    }
    const accountData = { address: '0x123' }

    mockCallBackground
      .mockRejectedValueOnce(
        'Failed to send message to background script after 3 attempts: The message port closed before a response was received.'
      )
      .mockResolvedValueOnce(accountData)
    mockCallPopup.mockResolvedValue({ appSession })

    const result = await requestAccount(Chain.Ethereum)

    expect(result).toEqual(accountData)
    expect(mockCallPopup).toHaveBeenCalledWith({
      grantVaultAccess: {
        preselectFastVault: undefined,
        chain: Chain.Ethereum,
      },
    })
  })

  it('does not open the popup for wrapped non-transport bridge errors', async () => {
    mockCallBackground.mockRejectedValue(
      'Failed to send message to background script after 3 attempts: Permission denied'
    )

    await expect(requestAccount(Chain.Ethereum)).rejects.toMatchObject({
      code: 4100,
      message: 'Unauthorized',
    })
    expect(mockCallPopup).not.toHaveBeenCalled()
  })

  it('throws EIP1193Error(UserRejectedRequest) when user rejects popup', async () => {
    // Background rejects with Unauthorized so popup is shown
    mockCallBackground.mockRejectedValueOnce(BackgroundError.Unauthorized)

    // User rejects in popup
    mockCallPopup.mockRejectedValue(PopupError.RejectedByUser)

    await expect(requestAccount(Chain.Ethereum)).rejects.toMatchObject({
      code: 4001,
      message: 'User rejected the request',
    })
  })

  it('throws EIP1193Error(Unauthorized) on non-Unauthorized background errors (e.g. no vault)', async () => {
    // Background rejects with something other than BackgroundError.Unauthorized
    // — e.g. shouldBePresent('currentVaultId') throwing when no vault exists.
    // Per EIP-1193, the dApp should see 4100 (Unauthorized), not -32603.
    mockCallBackground.mockRejectedValue(
      new Error('currentVaultId is required')
    )

    await expect(requestAccount(Chain.Ethereum)).rejects.toMatchObject({
      code: 4100,
      message: 'Unauthorized',
    })
    expect(mockCallPopup).not.toHaveBeenCalled()
  })

  it('throws EIP1193Error(InternalError) when popup rejects with a non-PopupError', async () => {
    mockCallBackground.mockRejectedValueOnce(BackgroundError.Unauthorized)

    // Popup rejects with something other than RejectedByUser — this is a
    // genuinely unexpected popup-internal failure.
    mockCallPopup.mockRejectedValue(new Error('popup crashed'))

    await expect(requestAccount(Chain.Solana)).rejects.toMatchObject({
      code: -32603,
    })
  })

  it('throws EIP1193Error(UserRejectedRequest) when popup resolves without an appSession', async () => {
    // Popup dismissed mid-flow (window closed without explicit reject signal).
    mockCallBackground.mockRejectedValueOnce(BackgroundError.Unauthorized)
    mockCallPopup.mockResolvedValue(undefined)

    await expect(requestAccount(Chain.Ethereum)).rejects.toMatchObject({
      code: 4001,
    })
  })

  it('throws EIP1193Error(Unauthorized) when post-grant getAccount returns empty address', async () => {
    // Defensive path: popup grants a session, but the freshly-selected vault
    // has no key for this chain. We must not return { address: '' } to dApps.
    const appSession = {
      vaultId: 'v1',
      host: 'example.com',
      url: 'https://example.com',
    }
    mockCallBackground
      .mockRejectedValueOnce(BackgroundError.Unauthorized)
      .mockResolvedValueOnce({ address: '', publicKey: '' })
    mockCallPopup.mockResolvedValue({ appSession })

    await expect(requestAccount(Chain.Ethereum)).rejects.toMatchObject({
      code: 4100,
      message: 'Unauthorized',
    })
  })

  it('throws EIP1193Error(Unauthorized) when post-grant getAccount rejects', async () => {
    // Defensive path: popup grants a session, but the follow-up getAccount
    // call fails. Surface 4100 rather than leaking the raw error.
    const appSession = {
      vaultId: 'v1',
      host: 'example.com',
      url: 'https://example.com',
    }
    mockCallBackground
      .mockRejectedValueOnce(BackgroundError.Unauthorized)
      .mockRejectedValueOnce(new Error('storage corrupt'))
    mockCallPopup.mockResolvedValue({ appSession })

    await expect(requestAccount(Chain.Ethereum)).rejects.toMatchObject({
      code: 4100,
    })
  })

  it('re-prompts via popup when vault is authorized but has no account for the chain', async () => {
    // Authorized vault, but no key for this chain (e.g. mldsa chain on a vault
    // without an mldsa key). getAccount returns { address: '' } — falsy address.
    const appSession = {
      vaultId: 'v1',
      host: 'example.com',
      url: 'https://example.com',
    }
    const accountData = { address: 'newAddress', publicKey: 'newKey' }
    mockCallBackground
      .mockResolvedValueOnce({ address: '', publicKey: '' })
      .mockResolvedValueOnce(accountData)
    mockCallPopup.mockResolvedValue({ appSession })

    const result = await requestAccount(Chain.Solana)

    expect(result).toEqual(accountData)
    expect(mockCallPopup).toHaveBeenCalledTimes(1)
  })

  it('works with Solana chain', async () => {
    const accountData = { address: 'SoLaNaPubKey123' }
    mockCallBackground.mockResolvedValue(accountData)

    const result = await requestAccount(Chain.Solana)

    expect(result).toEqual(accountData)
    expect(mockCallBackground).toHaveBeenCalledWith({
      getAccount: { chain: Chain.Solana },
    })
  })
})
