import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock('@core/inpage-provider/background/events/inpage', () => ({
  addBackgroundEventListener: vi.fn(),
}))

import { Ethereum } from '@clients/extension/src/inpage/providers/ethereum/index'
import { hasValidEthereumParams } from '@clients/extension/src/inpage/providers/ethereum/params'
import { Chain } from '@vultisig/core-chain/Chain'

const address = '0x1111111111111111111111111111111111111111'

describe('Ethereum provider params validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Ethereum.instance = null
    mockCallBackground.mockImplementation(async (call: Record<string, unknown>) =>
      'getAppChainId' in call ? '0x1' : '0x0'
    )
  })

  describe('wallet_switchEthereumChain', () => {
    it.each([
      ['missing params', undefined],
      ['empty params', []],
      ['a non-array params', { chainId: '0x89' }],
      ['an entry without chainId', [{}]],
      ['a numeric chainId', [{ chainId: 137 }]],
    ])('rejects %s with -32602', async (_, params) => {
      const eth = new Ethereum()

      await expect(
        eth.request({
          method: 'wallet_switchEthereumChain',
          params: params as unknown[],
        })
      ).rejects.toMatchObject({ code: -32602, message: 'Invalid params' })
      expect(mockCallBackground).not.toHaveBeenCalledWith(
        expect.objectContaining({ setAppChain: expect.anything() })
      )
    })

    it('still rejects an unsupported chain with 4902', async () => {
      const eth = new Ethereum()

      await expect(
        eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xffffff' }],
        })
      ).rejects.toMatchObject({ code: 4902 })
    })

    it('switches with well-formed params', async () => {
      const eth = new Ethereum()

      await expect(
        eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }],
        })
      ).resolves.toBeNull()
      expect(mockCallBackground).toHaveBeenCalledWith({
        setAppChain: { evm: Chain.Polygon },
      })
    })
  })

  describe('eth_getBalance', () => {
    it.each([
      ['missing params', undefined],
      ['empty params', []],
      ['a non-string address', [{ address }]],
    ])('rejects %s with -32602', async (_, params) => {
      const eth = new Ethereum()

      await expect(
        eth.request({ method: 'eth_getBalance', params: params as unknown[] })
      ).rejects.toMatchObject({ code: -32602 })
      expect(mockCallBackground).not.toHaveBeenCalledWith(
        expect.objectContaining({ evmClientRequest: expect.anything() })
      )
    })

    it('defaults the block tag when only the address is given', async () => {
      const eth = new Ethereum()

      await eth.request({ method: 'eth_getBalance', params: [address] })

      expect(mockCallBackground).toHaveBeenCalledWith({
        evmClientRequest: {
          method: 'eth_getBalance',
          params: [address, 'latest'],
        },
      })
    })
  })

  it('rejects wallet_watchAsset without an options object with -32602', async () => {
    const eth = new Ethereum()

    await expect(
      eth.request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20' } as unknown as unknown[],
      })
    ).rejects.toMatchObject({ code: -32602 })
    expect(mockCallPopup).not.toHaveBeenCalled()
  })

  it('serves parameterless methods without params', async () => {
    const eth = new Ethereum()

    await expect(
      eth.request({ method: 'eth_blockNumber' } as never)
    ).resolves.toBe('0x0')
  })

  it('answers Object.prototype keys as unsupported methods', async () => {
    const eth = new Ethereum()

    await expect(
      eth.request({ method: 'toString', params: [] })
    ).rejects.toMatchObject({ code: 4200 })
  })
})

describe('hasValidEthereumParams', () => {
  it.each([
    ['eth_requestAccounts', undefined],
    ['eth_requestAccounts', [{ preselectFastVault: true }]],
    ['wallet_requestPermissions', undefined],
    ['wallet_requestPermissions', [{ eth_accounts: {} }]],
    ['wallet_addEthereumChain', [{ chainId: '0x89', chainName: 'Polygon' }]],
    ['wallet_watchAsset', { type: 'ERC20', options: { address } }],
    ['eth_getStorageAt', [address, '0x0']],
    ['eth_feeHistory', [4, 'latest']],
    ['eth_call', [{ to: address }]],
    ['eth_getLogs', [{ address }]],
    ['personal_sign', ['0x68656c6c6f']],
    ['personal_sign', ['0x68656c6c6f', address]],
    ['eth_signTypedData_v4', []],
    ['eth_sendTransaction', [{ from: address }]],
  ] as const)('accepts %s with %j', (method, params) => {
    expect(hasValidEthereumParams({ method, params })).toBe(true)
  })

  it.each([
    ['wallet_addEthereumChain', []],
    ['wallet_watchAsset', [{ type: 'ERC20', options: { address } }]],
    ['wallet_requestPermissions', ['eth_accounts']],
    ['eth_getStorageAt', [address]],
    ['eth_feeHistory', [4]],
    ['eth_call', undefined],
    ['eth_getLogs', []],
    ['eth_getTransactionReceipt', []],
    ['personal_sign', []],
    ['eth_signTypedData_v4', undefined],
    ['eth_sendTransaction', []],
    ['eth_sendTransaction', ['0xdeadbeef']],
  ] as const)('rejects %s with %j', (method, params) => {
    expect(hasValidEthereumParams({ method, params })).toBe(false)
  })
})
