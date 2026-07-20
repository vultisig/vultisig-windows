import { Chain } from '@vultisig/core-chain/Chain'
import { getSolanaClient } from '@vultisig/core-chain/chains/solana/client'
import { describe, expect, it, vi } from 'vitest'

import { pollTxReceipt } from './txReceiptPolling'

const { getSignatureStatuses } = vi.hoisted(() => ({
  getSignatureStatuses: vi.fn(),
}))

vi.mock('@vultisig/core-chain/chains/solana/client', () => ({
  getSolanaClient: vi.fn(() => ({ getSignatureStatuses })),
}))

const schedule = {
  cosmos: { pollInterval: 0, maxAttempts: 2 },
  thorMaya: { pollInterval: 0, maxAttempts: 2 },
  utxo: { pollInterval: 0, maxAttempts: 2 },
  solana: { pollInterval: 0, maxAttempts: 2 },
}

const evmTxHash =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

const createDependencies = () => ({
  sleep: vi.fn().mockResolvedValue(undefined),
  waitForEvmReceipt: vi.fn().mockResolvedValue('confirmed' as const),
  getCosmosReceiptStatus: vi.fn().mockResolvedValue(null),
  getUtxoReceiptStatus: vi.fn().mockResolvedValue(null),
  getSolanaReceiptStatus: vi.fn().mockResolvedValue(null),
})

const getStatuses = (emitEvent: ReturnType<typeof vi.fn>) =>
  emitEvent.mock.calls.map(([, data]) => data.status)

describe('pollTxReceipt', () => {
  it('keeps an EVM transaction pending when receipt polling rejects', async () => {
    const emitEvent = vi.fn()
    const dependencies = createDependencies()
    dependencies.waitForEvmReceipt.mockRejectedValue(new Error('timeout'))

    await pollTxReceipt({
      chain: Chain.Ethereum,
      txHash: evmTxHash,
      conversationId: 'conversation',
      label: 'transfer',
      emitEvent,
      dependencies,
      schedule,
    })

    expect(getStatuses(emitEvent)).toEqual(['pending'])
  })

  it.each([
    ['Cosmos', Chain.Cosmos, 'getCosmosReceiptStatus'],
    ['UTXO', Chain.Bitcoin, 'getUtxoReceiptStatus'],
    ['Solana', Chain.Solana, 'getSolanaReceiptStatus'],
  ] as const)(
    'keeps a %s transaction pending after the observation window expires',
    async (_, chain, observerName) => {
      const emitEvent = vi.fn()
      const dependencies = createDependencies()

      await pollTxReceipt({
        chain,
        txHash: 'tx-hash',
        conversationId: 'conversation',
        label: 'transfer',
        emitEvent,
        dependencies,
        schedule,
      })

      expect(getStatuses(emitEvent)).toEqual(['pending'])
      expect(dependencies[observerName]).toHaveBeenCalledTimes(2)
    }
  )

  it.each([
    ['Cosmos', Chain.Cosmos, 'getCosmosReceiptStatus'],
    ['UTXO', Chain.Bitcoin, 'getUtxoReceiptStatus'],
    ['Solana', Chain.Solana, 'getSolanaReceiptStatus'],
  ] as const)(
    'keeps a %s transaction pending through transport errors',
    async (_, chain, observerName) => {
      const emitEvent = vi.fn()
      const dependencies = createDependencies()
      dependencies[observerName].mockRejectedValue(new Error('transport'))

      await pollTxReceipt({
        chain,
        txHash: 'tx-hash',
        conversationId: 'conversation',
        label: 'transfer',
        emitEvent,
        dependencies,
        schedule,
      })

      expect(getStatuses(emitEvent)).toEqual(['pending'])
    }
  )

  it.each([
    ['EVM', Chain.Ethereum, 'waitForEvmReceipt'],
    ['Cosmos', Chain.Cosmos, 'getCosmosReceiptStatus'],
    ['UTXO', Chain.Bitcoin, 'getUtxoReceiptStatus'],
    ['Solana', Chain.Solana, 'getSolanaReceiptStatus'],
  ] as const)(
    'emits failed for a positive %s chain failure',
    async (_, chain, observerName) => {
      const emitEvent = vi.fn()
      const dependencies = createDependencies()
      dependencies[observerName].mockResolvedValue('failed')
      const txHash = chain === Chain.Ethereum ? evmTxHash : 'tx-hash'

      await pollTxReceipt({
        chain,
        txHash,
        conversationId: 'conversation',
        label: 'transfer',
        emitEvent,
        dependencies,
        schedule,
      })

      expect(getStatuses(emitEvent)).toEqual(['pending', 'failed'])
    }
  )

  it('emits confirmed with the original transaction context', async () => {
    const emitEvent = vi.fn()
    const dependencies = createDependencies()

    await pollTxReceipt({
      chain: Chain.Ethereum,
      txHash: evmTxHash,
      conversationId: 'conversation',
      label: 'swap',
      emitEvent,
      dependencies,
      schedule,
    })

    expect(emitEvent).toHaveBeenLastCalledWith('tx_status', {
      conversationId: 'conversation',
      txHash: evmTxHash,
      chain: Chain.Ethereum,
      status: 'confirmed',
      label: 'swap',
    })
  })

  it('does not query an EVM receipt for an invalid hash', async () => {
    const emitEvent = vi.fn()
    const dependencies = createDependencies()

    await pollTxReceipt({
      chain: Chain.Ethereum,
      txHash: '0xabc',
      conversationId: 'conversation',
      label: 'transfer',
      emitEvent,
      dependencies,
      schedule,
    })

    expect(dependencies.waitForEvmReceipt).not.toHaveBeenCalled()
    expect(getStatuses(emitEvent)).toEqual(['pending'])
  })

  it('keeps a processed Solana transaction pending', async () => {
    const emitEvent = vi.fn()
    getSignatureStatuses.mockResolvedValue({
      value: [{ err: null, confirmationStatus: 'processed' }],
    })

    await pollTxReceipt({
      chain: Chain.Solana,
      txHash: 'signature',
      conversationId: 'conversation',
      label: 'transfer',
      emitEvent,
      schedule,
    })

    expect(getSolanaClient).toHaveBeenCalled()
    expect(getStatuses(emitEvent)).toEqual(['pending'])
  })
})
