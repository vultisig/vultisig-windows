import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock('@core/inpage-provider/popup/error', () => ({
  PopupError: { RejectedByUser: 'RejectedByUser' },
}))

vi.mock('@vultisig/core-chain/Chain', () => ({
  Chain: { Ton: 'TON' },
}))

vi.mock('@vultisig/core-chain/coin/chainFeeCoin', () => ({
  chainFeeCoin: {
    TON: { ticker: 'TON', decimals: 9 },
  },
}))

vi.mock('@ton/core', () => ({
  Address: {
    parse: vi.fn((addr: string) => ({
      toRawString: () => addr,
    })),
  },
}))

vi.mock(
  '@clients/extension/src/inpage/providers/tonConnect/walletManifest',
  () => ({
    getTonConnectDeviceInfo: () => ({
      platform: 'chrome',
      appName: 'Vultisig',
      appVersion: '1.0.0',
      maxProtocolVersion: 2,
      features: [{ name: 'SendTransaction', maxMessages: 4 }],
    }),
    getTonConnectWalletInfo: () => ({
      name: 'Vultisig',
      image: '',
      about_url: '',
    }),
  })
)

vi.mock(
  '@clients/extension/src/inpage/providers/tonConnect/tonProof',
  () => ({
    buildTonProofPayload: vi.fn(),
    formatTonProofReply: vi.fn(),
    getTonProofHash: vi.fn(),
  })
)

vi.mock(
  '@clients/extension/src/inpage/providers/tonConnect/signData',
  () => ({
    buildSignDataTextBinaryHash: vi.fn(),
    buildSignDataCellHash: vi.fn(),
  })
)

vi.mock(
  '@clients/extension/src/inpage/providers/tonConnect/getWalletStateInit',
  () => ({
    getWalletStateInit: vi.fn(() => 'mock-state-init'),
  })
)

import { TonConnectBridge } from '@clients/extension/src/inpage/providers/tonConnect/index'
import type { AppRequest } from '@tonconnect/protocol'

const testAccount = {
  address: 'EQCmBAn_latV6yLWm391BEFTWP7jZX5mUFJ4Dc5TJAnvVkCz',
  publicKey: 'a60409ef95ab55eb22d69b7f7504415358fee3657e665052780dce532409ef56',
}

const validUntil = () => Math.floor(Date.now() / 1000) + 600

const makeSendTxRequest = (
  payload: Record<string, unknown>
): AppRequest<'sendTransaction'> => ({
  method: 'sendTransaction',
  params: [JSON.stringify(payload)],
  id: '1',
})

describe('TonConnectBridge.send', () => {
  let bridge: TonConnectBridge

  beforeEach(() => {
    vi.clearAllMocks()
    bridge = new TonConnectBridge()

    mockCallBackground.mockImplementation(
      async (call: Record<string, unknown>) => {
        if ('getAccount' in call) return testAccount
        if ('signOut' in call) return undefined
        throw new Error(`Unmocked background call: ${JSON.stringify(call)}`)
      }
    )
  })

  describe('disconnect via send()', () => {
    it('should call disconnect and return success', async () => {
      const result = await bridge.send({
        method: 'disconnect',
        params: [],
        id: '1',
      } as AppRequest<'disconnect'>)

      expect(result).toEqual({ id: '1', result: '' })
      expect(mockCallBackground).toHaveBeenCalledWith({ signOut: {} })
    })
  })

  describe('sendTransaction validation', () => {
    it('should reject invalid JSON payload', async () => {
      const result = await bridge.send({
        method: 'sendTransaction',
        params: ['not-json'],
        id: '1',
      } as AppRequest<'sendTransaction'>)

      expect(result).toHaveProperty('error')
      expect((result as any).error.message).toBe(
        'Invalid sendTransaction payload'
      )
    })

    it('should reject expired transaction', async () => {
      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: Math.floor(Date.now() / 1000) - 10,
          messages: [
            { address: 'EQTest', amount: '100000000' },
          ],
        })
      )

      expect((result as any).error.message).toBe(
        'sendTransaction request expired'
      )
    })

    it('should reject unsupported network', async () => {
      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          network: '-3',
          messages: [{ address: 'EQTest', amount: '100000000' }],
        })
      )

      expect((result as any).error.message).toBe('Unsupported TON network')
    })

    it('should reject empty messages array', async () => {
      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [],
        })
      )

      expect((result as any).error.message).toBe(
        'At least one transaction message is required'
      )
    })

    it('should reject message without address', async () => {
      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [{ amount: '100000000' }],
        })
      )

      expect((result as any).error.message).toBe(
        'Message 1: recipient address is required'
      )
    })

    it('should reject message without amount', async () => {
      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [{ address: 'EQTest' }],
        })
      )

      expect((result as any).error.message).toBe(
        'Message 1: amount is required'
      )
    })

    it('should reject message with non-positive amount', async () => {
      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [{ address: 'EQTest', amount: '0' }],
        })
      )

      expect((result as any).error.message).toBe(
        'Message 1: amount must be a positive integer'
      )
    })

    it('should reject more messages than maxMessages', async () => {
      const messages = Array.from({ length: 5 }, (_, i) => ({
        address: `EQTest${i}`,
        amount: '100000000',
      }))

      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages,
        })
      )

      expect((result as any).error.message).toBe(
        'Only up to 4 message(s) are supported'
      )
    })
  })

  describe('stateInit passthrough', () => {
    it('should pass stateInit in tonMessages to the popup', async () => {
      const stateInitBoc = 'te6cckEBAQEAJAAAQ4ABase64EncodedStateInit'

      mockCallPopup.mockResolvedValue([
        { data: { encoded: 'mock-boc-result' } },
      ])

      await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '100000000',
              payload: 'te6cckEBAQEABgAACAAAAA==',
              stateInit: stateInitBoc,
            },
          ],
        })
      )

      expect(mockCallPopup).toHaveBeenCalled()
      const popupCall = mockCallPopup.mock.calls[0][0]
      const tonMessages = popupCall.sendTx.keysign.transactionDetails.tonMessages

      expect(tonMessages).toHaveLength(1)
      expect(tonMessages[0].stateInit).toBe(stateInitBoc)
      expect(tonMessages[0].payload).toBe('te6cckEBAQEABgAACAAAAA==')
    })

    it('should pass undefined stateInit when not provided', async () => {
      mockCallPopup.mockResolvedValue([
        { data: { encoded: 'mock-boc-result' } },
      ])

      await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '100000000',
            },
          ],
        })
      )

      expect(mockCallPopup).toHaveBeenCalled()
      const popupCall = mockCallPopup.mock.calls[0][0]
      const tonMessages = popupCall.sendTx.keysign.transactionDetails.tonMessages

      expect(tonMessages).toHaveLength(1)
      expect(tonMessages[0].stateInit).toBeUndefined()
    })

    it('should pass stateInit on multiple messages independently', async () => {
      mockCallPopup.mockResolvedValue([
        { data: { encoded: 'mock-boc-result' } },
      ])

      await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '50000000',
              stateInit: 'state-init-1',
            },
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '50000000',
            },
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '50000000',
              stateInit: 'state-init-3',
            },
          ],
        })
      )

      const popupCall = mockCallPopup.mock.calls[0][0]
      const tonMessages = popupCall.sendTx.keysign.transactionDetails.tonMessages

      expect(tonMessages).toHaveLength(3)
      expect(tonMessages[0].stateInit).toBe('state-init-1')
      expect(tonMessages[1].stateInit).toBeUndefined()
      expect(tonMessages[2].stateInit).toBe('state-init-3')
    })
  })

  describe('sendTransaction success', () => {
    it('should return signed BOC on success', async () => {
      const bocResult = 'te6cckEBAgSignedBoc'

      mockCallPopup.mockResolvedValue([
        { data: { encoded: bocResult } },
      ])

      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '100000000',
            },
          ],
        })
      )

      expect(result).toHaveProperty('result', bocResult)
    })

    it('should pass chain as Ton in the keysign payload', async () => {
      mockCallPopup.mockResolvedValue([
        { data: { encoded: 'mock-boc' } },
      ])

      await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '100000000',
            },
          ],
        })
      )

      const popupCall = mockCallPopup.mock.calls[0][0]
      expect(popupCall.sendTx.keysign.chain).toBe('TON')
    })
  })

  describe('sendTransaction error handling', () => {
    it('should return user rejected error when popup is rejected', async () => {
      mockCallPopup.mockRejectedValue('RejectedByUser')

      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '100000000',
            },
          ],
        })
      )

      expect((result as any).error.code).toBe(300)
      expect((result as any).error.message).toBe(
        'User declined the transaction'
      )
    })

    it('should return error when getAccount fails', async () => {
      mockCallBackground.mockRejectedValue(new Error('no account'))

      const result = await bridge.send(
        makeSendTxRequest({
          valid_until: validUntil(),
          messages: [
            {
              address: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
              amount: '100000000',
            },
          ],
        })
      )

      expect((result as any).error.code).toBe(100)
      expect((result as any).error.message).toBe('Failed to get account')
    })
  })
})
