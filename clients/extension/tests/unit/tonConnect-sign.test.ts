import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock(
  '@clients/extension/src/inpage/providers/tonConnect/getWalletStateInit',
  () => ({
    getWalletStateInit: vi.fn(() => 'mock-state-init'),
  })
)

import { TonConnectBridge } from '@clients/extension/src/inpage/providers/tonConnect/index'
import type { ConnectRequest } from '@tonconnect/protocol'
import { OtherChain } from '@vultisig/core-chain/Chain'

const testAccount = {
  address: '0:8a8627861a5dd96c9db3ce0807b122da5ed473934ce7568a5b4b1c361cbb28ae',
  publicKey: 'a60409ef95ab55eb22d69b7f7504415358fee3657e665052780dce532409ef56',
}

const signatureHex = 'ab'.repeat(64)

describe('TonConnectBridge signing requests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCallBackground.mockResolvedValue(testAccount)
    mockCallPopup.mockImplementation(async (call: Record<string, unknown>) =>
      'grantVaultAccess' in call ? { appSession: {} } : signatureHex
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends ton_proof as a readable request for the popup to hash', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ url: 'https://app.example.com' }), {
            headers: { 'content-type': 'application/json' },
          })
      )
    )
    const request: ConnectRequest = {
      manifestUrl: 'https://app.example.com/tonconnect-manifest.json',
      items: [{ name: 'ton_addr' }, { name: 'ton_proof', payload: 'nonce-1' }],
    }

    const event = await new TonConnectBridge().connect(2, request)

    expect(event.event).toBe('connect')
    expect(mockCallPopup).toHaveBeenCalledWith({
      signMessage: {
        ton_proof: {
          chain: OtherChain.Ton,
          domain: 'app.example.com',
          timestamp: expect.any(Number),
          payload: 'nonce-1',
        },
      },
    })
  })

  it('sends signData as its payload rather than a hash', async () => {
    const response = await new TonConnectBridge().send({
      method: 'signData',
      params: [JSON.stringify({ type: 'text', text: 'Hello', network: '-239' })],
      id: '7',
    })

    expect(mockCallPopup).toHaveBeenCalledWith(
      {
        signMessage: {
          ton_sign_data: {
            chain: OtherChain.Ton,
            timestamp: expect.any(Number),
            payload: { type: 'text', text: 'Hello' },
          },
        },
      },
      { account: testAccount.address }
    )
    expect(response).toMatchObject({
      id: '7',
      result: { signature: Buffer.from(signatureHex, 'hex').toString('base64') },
    })
  })

  it('refuses binary data that is not base64 without opening the popup', async () => {
    const response = await new TonConnectBridge().send({
      method: 'signData',
      params: [JSON.stringify({ type: 'binary', bytes: '@@@' })],
      id: '8',
    })

    expect(response).toMatchObject({ id: '8', error: { code: 1 } })
    expect(mockCallPopup).not.toHaveBeenCalled()
  })
})
