import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SwapTransactionRecord, TransactionRecord } from '../core'

const { getTxStatus, getSwapArrivalStatus } = vi.hoisted(() => ({
  getTxStatus: vi.fn(),
  getSwapArrivalStatus: vi.fn(),
}))
vi.mock('@vultisig/core-chain/tx/status', () => ({ getTxStatus }))
vi.mock('@vultisig/core-chain/swap/utils/getSwapArrivalStatus', () => ({
  getSwapArrivalStatus,
}))

import {
  getArrivalTrackedSwap,
  getSwapArrivalRecordUpdate,
} from './getSwapArrivalRecordUpdate'

const pendingSwap: SwapTransactionRecord = {
  id: 'record-1',
  vaultId: 'vault-1',
  chain: Chain.THORChain,
  txHash: '0xabc',
  explorerUrl: '',
  fiatValue: '',
  timestamp: new Date().toISOString(),
  status: 'pending',
  type: 'swap',
  data: {
    fromToken: 'ETH',
    fromAmount: '1',
    fromChain: Chain.Ethereum,
    fromDecimals: 18,
    fromTokenLogo: '',
    toToken: 'BTC',
    toAmount: '0.05',
    toDecimals: 8,
    toTokenLogo: '',
    toChain: Chain.Bitcoin,
    arrivalProvider: 'thorchain',
  },
}

const withData = (
  data: Partial<SwapTransactionRecord['data']>
): TransactionRecord => ({
  ...pendingSwap,
  data: { ...pendingSwap.data, ...data },
})

describe('getArrivalTrackedSwap', () => {
  it('tracks a swap that stored a known provider', () => {
    expect(getArrivalTrackedSwap(pendingSwap)).toEqual({
      record: pendingSwap,
      provider: 'thorchain',
    })
  })

  it('leaves an aggregator swap, and a provider this build does not know, to the chain', () => {
    expect(
      getArrivalTrackedSwap(withData({ arrivalProvider: undefined }))
    ).toBeUndefined()
    expect(
      getArrivalTrackedSwap(
        withData({
          arrivalProvider:
            'skip' as SwapTransactionRecord['data']['arrivalProvider'],
        })
      )
    ).toBeUndefined()
  })
})

describe('getSwapArrivalRecordUpdate', () => {
  beforeEach(() => vi.clearAllMocks())

  const tracked = { record: pendingSwap, provider: 'thorchain' as const }

  it('reads the deposit on the chain the funds left from, not the provider chain', async () => {
    getTxStatus.mockResolvedValue({ status: 'pending' })

    await getSwapArrivalRecordUpdate(tracked)

    expect(getTxStatus).toHaveBeenCalledWith(
      expect.objectContaining({ chain: Chain.Ethereum, hash: '0xabc' })
    )
    expect(getSwapArrivalStatus).not.toHaveBeenCalled()
  })

  it('fails the record when the deposit itself reverts', async () => {
    getTxStatus.mockResolvedValue({ status: 'error' })

    const update = await getSwapArrivalRecordUpdate(tracked)

    expect(update.status).toBe('error')
    expect(update.record?.status).toBe('failed')
    expect(getSwapArrivalStatus).not.toHaveBeenCalled()
  })

  it('keeps the record pending after the deposit confirms until the provider settles', async () => {
    getTxStatus.mockResolvedValue({ status: 'success' })
    getSwapArrivalStatus.mockResolvedValue({
      status: 'pending',
      stage: 'swapping',
    })

    const update = await getSwapArrivalRecordUpdate(tracked)

    expect(getSwapArrivalStatus).toHaveBeenCalledWith({
      provider: 'thorchain',
      txHash: '0xabc',
    })
    expect(update).toEqual({ status: 'pending' })
  })

  it('confirms the record once the provider paid out', async () => {
    getTxStatus.mockResolvedValue({ status: 'success' })
    getSwapArrivalStatus.mockResolvedValue({
      status: 'success',
      stage: 'complete',
    })

    const update = await getSwapArrivalRecordUpdate(tracked)

    expect(update.status).toBe('success')
    expect(update.record?.status).toBe('confirmed')
  })

  it('fails the record with the refund reason when the provider sent the funds back', async () => {
    getTxStatus.mockResolvedValue({ status: 'success' })
    getSwapArrivalStatus.mockResolvedValue({
      status: 'refunded',
      stage: 'refunded',
    })

    const update = await getSwapArrivalRecordUpdate(tracked)

    expect(update.status).toBe('error')
    expect(update.record).toMatchObject({
      status: 'failed',
      data: { failureReason: 'refunded' },
    })
  })

  it('fails the record without a reason when the provider reports a plain failure', async () => {
    getTxStatus.mockResolvedValue({ status: 'success' })
    getSwapArrivalStatus.mockResolvedValue({ status: 'error', stage: 'failed' })

    const update = await getSwapArrivalRecordUpdate(tracked)

    expect(update.status).toBe('error')
    expect(update.record?.status).toBe('failed')
    expect(
      update.record?.type === 'swap' && update.record.data.failureReason
    ).toBeUndefined()
  })
})
