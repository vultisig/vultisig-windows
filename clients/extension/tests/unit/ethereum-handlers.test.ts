import { describe, expect, it, vi } from 'vitest'

// Mock all resolver imports so we can test the handler map structure
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_accounts', () => ({
  getEthAccounts: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_blockNumber', () => ({
  getEthBlockNumber: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_call', () => ({
  callEth: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_chainId', () => ({
  getEthChainId: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_estimateGas', () => ({
  estimateEthGas: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_feeHistory', () => ({
  getEthFeeHistory: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_gasPrice', () => ({
  getEthGasPrice: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getBalance', () => ({
  getEthBalance: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getBlockByHash', () => ({
  getEthBlockByHash: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getBlockByNumber', () => ({
  getEthBlockByNumber: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getCode', () => ({
  getEthCode: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getLogs', () => ({
  getEthLogs: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getStorageAt', () => ({
  getEthStorageAt: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getTransactionByHash', () => ({
  getEthTransactionByHash: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getTransactionCount', () => ({
  getEthTransactionCount: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_getTransactionReceipt', () => ({
  getEthTransactionReceipt: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_maxPriorityFeePerGas', () => ({
  getEthMaxPriorityFeePerGas: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_requestAccounts', () => ({
  requestEthAccounts: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_sendTransaction', () => ({
  sendEthTransaction: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/eth_signTypedData_v4', () => ({
  signEthTypedDataV4: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/net_version', () => ({
  getNetVersion: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/personal_sign', () => ({
  personalSign: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_addEthereumChain', () => ({
  addEthereumChain: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_getCapabilities', () => ({
  getWalletCapabilities: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_getPermissions', () => ({
  getWalletPermissions: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_requestPermissions', () => ({
  requestWalletPermissions: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_revokePermissions', () => ({
  revokeWalletPermissions: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_switchEthereumChain', () => ({
  switchEthereumChain: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_watchAsset', () => ({
  watchAsset: vi.fn(),
}))
vi.mock('@clients/extension/src/inpage/providers/ethereum/utils', () => ({
  processSignature: vi.fn(),
}))

import { ethereumHandlers } from '@clients/extension/src/inpage/providers/ethereum/handlers'

describe('ethereumHandlers map', () => {
  const expectedMethods = [
    'eth_chainId',
    'eth_accounts',
    'eth_requestAccounts',
    'wallet_switchEthereumChain',
    'wallet_getCapabilities',
    'wallet_addEthereumChain',
    'wallet_watchAsset',
    'wallet_getPermissions',
    'wallet_requestPermissions',
    'wallet_revokePermissions',
    'net_version',
    'eth_getCode',
    'eth_getTransactionCount',
    'eth_getBalance',
    'eth_blockNumber',
    'eth_getBlockByHash',
    'eth_getBlockByNumber',
    'eth_feeHistory',
    'eth_gasPrice',
    'eth_getLogs',
    'eth_getStorageAt',
    'eth_maxPriorityFeePerGas',
    'eth_estimateGas',
    'eth_call',
    'eth_getTransactionReceipt',
    'eth_getTransactionByHash',
    'eth_signTypedData_v4',
    'personal_sign',
    'eth_sendTransaction',
  ]

  it('has all expected EIP-1193 / wallet methods', () => {
    for (const method of expectedMethods) {
      expect(ethereumHandlers).toHaveProperty(method)
    }
  })

  it('has exactly the expected number of methods (no extras)', () => {
    expect(Object.keys(ethereumHandlers)).toHaveLength(expectedMethods.length)
  })

  it('all handlers are functions', () => {
    for (const [method, handler] of Object.entries(ethereumHandlers)) {
      expect(typeof handler).toBe('function')
    }
  })

  it.each(expectedMethods)('handler for %s is defined', (method) => {
    const handler = ethereumHandlers[method as keyof typeof ethereumHandlers]
    expect(handler).toBeDefined()
    expect(typeof handler).toBe('function')
  })
})
