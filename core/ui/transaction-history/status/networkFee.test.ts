import { Chain } from '@vultisig/core-chain/Chain'
import { TxReceiptInfo } from '@vultisig/core-chain/tx/status'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { describe, expect, it } from 'vitest'

import {
  LimitSwapTransactionRecord,
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecordStatus,
} from '../core'
import {
  getNetworkFeeBackfillRecord,
  getRecordFeeChain,
  withReceiptNetworkFee,
} from './networkFee'

// The swap leg of the aEthUSDC → ETH swap in the report: 0.000904337 ETH.
const swapReceipt: TxReceiptInfo = {
  feeAmount: 904_337_000_000_000n,
  feeDecimals: 18,
  feeTicker: 'ETH',
}

const send = (
  status: TransactionRecordStatus = 'confirmed'
): SendTransactionRecord => ({
  id: 'send-1',
  vaultId: 'vault',
  type: 'send',
  status,
  chain: Chain.Ethereum,
  timestamp: '2026-09-24T12:00:00.000Z',
  txHash: '0xsend',
  explorerUrl: '',
  fiatValue: '',
  data: {
    fromAddress: '0xfrom',
    toAddress: '0xto',
    amount: '1000000000000000',
    token: 'ETH',
    tokenLogo: 'eth',
    decimals: 18,
  },
})

const swap = (
  data: Partial<SwapTransactionRecord['data']> = {}
): SwapTransactionRecord => ({
  id: 'swap-1',
  vaultId: 'vault',
  type: 'swap',
  status: 'confirmed',
  chain: Chain.Ethereum,
  timestamp: '2026-09-24T12:00:00.000Z',
  txHash: '0xswap',
  explorerUrl: '',
  fiatValue: '',
  data: {
    fromToken: 'aEthUSDC',
    fromAmount: '100000000',
    fromChain: Chain.Ethereum,
    fromTokenLogo: '',
    fromDecimals: 6,
    toToken: 'ETH',
    toAmount: '0.04',
    toChain: Chain.Ethereum,
    toTokenLogo: '',
    toDecimals: 18,
    ...data,
  },
})

const limitSwap: LimitSwapTransactionRecord = {
  id: 'limit-1',
  vaultId: 'vault',
  type: 'limitSwap',
  status: 'confirmed',
  chain: Chain.THORChain,
  timestamp: '2026-09-24T12:00:00.000Z',
  txHash: 'ABC',
  explorerUrl: '',
  fiatValue: '',
  data: {
    fromAddress: 'thor1from',
    fromToken: 'RUNE',
    fromTokenLogo: '',
    fromChain: Chain.THORChain,
    fromDecimals: 8,
    fromAmount: '100000000',
    buyTicker: 'BTC',
    targetAsset: 'BTC.BTC',
    minimumReceived: '0.001',
    destinationAddress: 'bc1dest',
    memo: '=<:BTC.BTC:bc1dest:100000',
    orderStatus: 'resting',
  },
}

describe('withReceiptNetworkFee', () => {
  it('stores what the receipt says the transaction paid', () => {
    expect(
      withReceiptNetworkFee({ record: swap(), receipt: swapReceipt })?.data
        .networkFee
    ).toEqual({ amount: '904337000000000', decimals: 18, ticker: 'ETH' })
  })

  it('adds nothing before there is a receipt', () => {
    expect(
      withReceiptNetworkFee({ record: send(), receipt: undefined })
    ).toBeNull()
  })

  it('keeps the fee it already stored', () => {
    const stored = shouldBePresent(
      withReceiptNetworkFee({ record: send(), receipt: swapReceipt })
    )

    expect(
      withReceiptNetworkFee({
        record: stored,
        receipt: { ...swapReceipt, feeAmount: 1n },
      })
    ).toBeNull()
  })

  // The settlement transaction is the solver's; its gas is not the user's fee.
  it('never charges a CowSwap order the settlement gas', () => {
    expect(
      withReceiptNetworkFee({
        record: swap({ cowSwapOrderApiBase: 'https://api.cow.fi/mainnet' }),
        receipt: swapReceipt,
      })
    ).toBeNull()
  })
})

describe('getRecordFeeChain', () => {
  it('reads a native swap on the chain its deposit left from', () => {
    expect(
      getRecordFeeChain({
        ...swap({ fromChain: Chain.Ethereum }),
        chain: Chain.THORChain,
      })
    ).toBe(Chain.Ethereum)
  })

  it('reads a send on its own chain', () => {
    expect(getRecordFeeChain(send())).toBe(Chain.Ethereum)
  })
})

describe('getNetworkFeeBackfillRecord', () => {
  it.each<TransactionRecordStatus>(['confirmed', 'failed'])(
    'picks a %s record with no fee',
    status => {
      const record = send(status)

      expect(getNetworkFeeBackfillRecord(record)).toBe(record)
    }
  )

  it.each<TransactionRecordStatus>(['signed', 'broadcasted', 'pending'])(
    'leaves a %s record to the status poll',
    status => {
      expect(getNetworkFeeBackfillRecord(send(status))).toBeNull()
    }
  )

  it('skips a record that has its fee, a CowSwap order and a limit order', () => {
    expect(
      getNetworkFeeBackfillRecord(
        shouldBePresent(
          withReceiptNetworkFee({ record: send(), receipt: swapReceipt })
        )
      )
    ).toBeNull()
    expect(
      getNetworkFeeBackfillRecord(
        swap({ cowSwapOrderApiBase: 'https://api.cow.fi/mainnet' })
      )
    ).toBeNull()
    expect(getNetworkFeeBackfillRecord(limitSwap)).toBeNull()
  })
})
