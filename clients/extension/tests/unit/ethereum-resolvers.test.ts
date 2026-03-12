import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock external modules
const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()
const mockRequestAccount = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: (...args: unknown[]) => mockRequestAccount(...args),
}))

// Mock the utils module (getChain, processSignature)
const mockGetChain = vi.fn()
const mockProcessSignature = vi.fn()

vi.mock('@clients/extension/src/inpage/providers/ethereum/utils', () => ({
  getChain: (...args: unknown[]) => mockGetChain(...args),
  processSignature: (...args: unknown[]) => mockProcessSignature(...args),
  switchChainHandler: vi.fn(),
}))

// Now import the resolvers
import { getEthChainId } from '@clients/extension/src/inpage/providers/ethereum/resolvers/eth_chainId'
import { getEthAccounts } from '@clients/extension/src/inpage/providers/ethereum/resolvers/eth_accounts'
import { requestEthAccounts } from '@clients/extension/src/inpage/providers/ethereum/resolvers/eth_requestAccounts'
import { personalSign } from '@clients/extension/src/inpage/providers/ethereum/resolvers/personal_sign'

describe('Ethereum Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('eth_chainId', () => {
    it('calls callBackground with getAppChainId for evm', async () => {
      mockCallBackground.mockResolvedValue('0x1')

      const result = await getEthChainId()

      expect(result).toBe('0x1')
      expect(mockCallBackground).toHaveBeenCalledWith({
        getAppChainId: { chainKind: 'evm' },
      })
    })

    it('returns whatever chainId the background provides', async () => {
      mockCallBackground.mockResolvedValue('0x89') // Polygon

      const result = await getEthChainId()
      expect(result).toBe('0x89')
    })
  })

  describe('eth_accounts', () => {
    it('returns array with address when account is found', async () => {
      mockGetChain.mockResolvedValue('Ethereum')
      mockCallBackground.mockResolvedValue({ address: '0xABC123' })

      const result = await getEthAccounts()

      expect(result).toEqual(['0xABC123'])
    })

    it('returns empty array when callBackground fails', async () => {
      mockGetChain.mockResolvedValue('Ethereum')
      mockCallBackground.mockRejectedValue(new Error('no account'))

      const result = await getEthAccounts()

      expect(result).toEqual([])
    })

    it('returns empty array when getChain fails', async () => {
      mockGetChain.mockRejectedValue(new Error('no chain'))

      const result = await getEthAccounts()

      expect(result).toEqual([])
    })
  })

  describe('eth_requestAccounts', () => {
    it('calls requestAccount and returns address in array', async () => {
      mockGetChain.mockResolvedValue('Ethereum')
      mockRequestAccount.mockResolvedValue({ address: '0xMyAddress' })

      const result = await requestEthAccounts(undefined)

      expect(result).toEqual(['0xMyAddress'])
      expect(mockRequestAccount).toHaveBeenCalled()
    })

    it('passes preselectFastVault option through', async () => {
      mockGetChain.mockResolvedValue('Ethereum')
      mockRequestAccount.mockResolvedValue({ address: '0xAddr' })

      await requestEthAccounts([{ preselectFastVault: true }])

      expect(mockRequestAccount).toHaveBeenCalledWith(
        'Ethereum',
        { preselectFastVault: true }
      )
    })

    it('propagates errors from requestAccount', async () => {
      mockGetChain.mockResolvedValue('Ethereum')
      const error = new Error('user rejected')
      mockRequestAccount.mockRejectedValue(error)

      await expect(requestEthAccounts(undefined)).rejects.toThrow('user rejected')
    })
  })

  describe('personal_sign', () => {
    it('calls callPopup with signMessage and processes the signature', async () => {
      mockGetChain.mockResolvedValue('Ethereum')
      mockCallPopup.mockResolvedValue('0xdeadbeef')
      mockProcessSignature.mockReturnValue('0xprocessed')

      const result = await personalSign(['0x68656c6c6f', '0xAccountAddr'])

      expect(result).toBe('0xprocessed')
      expect(mockCallPopup).toHaveBeenCalledWith(
        {
          signMessage: {
            personal_sign: {
              bytesCount: expect.any(Number),
              chain: 'Ethereum',
              message: '0x68656c6c6f',
              type: 'default',
            },
          },
        },
        { account: '0xAccountAddr' }
      )
      expect(mockProcessSignature).toHaveBeenCalledWith('0xdeadbeef')
    })

    it('handles non-hex message input', async () => {
      mockGetChain.mockResolvedValue('Ethereum')
      mockCallPopup.mockResolvedValue('0xsig')
      mockProcessSignature.mockReturnValue('0xresult')

      const result = await personalSign(['Hello World', '0xAddr'])

      expect(result).toBe('0xresult')
      // For non-hex string, bytesCount should be the byte length of the UTF-8 encoded string
      expect(mockCallPopup).toHaveBeenCalledWith(
        {
          signMessage: {
            personal_sign: {
              bytesCount: 11, // "Hello World" = 11 bytes
              chain: 'Ethereum',
              message: 'Hello World',
              type: 'default',
            },
          },
        },
        { account: '0xAddr' }
      )
    })
  })
})
