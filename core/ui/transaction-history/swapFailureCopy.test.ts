import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { SwapTransactionRecord, TransactionRecord } from './core'
import { getRecordFailureReason, swapFailureCopy } from './swapFailureCopy'

const failedSwap: SwapTransactionRecord = {
  id: 'record-1',
  vaultId: 'vault-1',
  chain: Chain.Ethereum,
  txHash: '0xabc',
  explorerUrl: 'https://etherscan.io/tx/0xabc',
  fiatValue: '3000',
  timestamp: new Date().toISOString(),
  status: 'failed',
  type: 'swap',
  data: {
    fromToken: 'ETH',
    fromAmount: '1',
    fromChain: Chain.Ethereum,
    fromDecimals: 18,
    fromTokenLogo: '',
    toToken: 'USDC',
    toAmount: '3000',
    toDecimals: 6,
    toTokenLogo: '',
    toChain: Chain.Ethereum,
    failureReason: 'slippage',
  },
}

describe('getRecordFailureReason', () => {
  it('reads the reason a failed swap was given', () => {
    expect(getRecordFailureReason(failedSwap)).toBe('slippage')
  })

  // The heal path only rewrites `status`, so a record that turns out to have
  // landed keeps the reason it was failed with. It must stop explaining itself.
  it('stops explaining a record that healed back to confirmed', () => {
    expect(
      getRecordFailureReason({ ...failedSwap, status: 'confirmed' })
    ).toBeUndefined()
  })

  // Records outlive the build that wrote them. Reading an unknown reason
  // straight through would index the copy map with a key it does not hold, and
  // take down every row in the list rather than the one it belongs to.
  it('ignores a reason this build has no wording for', () => {
    // Round-tripped through JSON the way storage hands a record back, because
    // that is the only way such a record can exist: this build's types will not
    // let it be written, and the build that wrote it had types of its own.
    const fromNewerBuild: TransactionRecord = JSON.parse(
      JSON.stringify({
        ...failedSwap,
        data: { ...failedSwap.data, failureReason: 'insufficientGas' },
      })
    )

    const reason = getRecordFailureReason(fromNewerBuild)

    expect(reason).toBeUndefined()
    expect(reason && swapFailureCopy[reason]).toBeFalsy()
  })
})
