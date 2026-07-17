import { Chain } from '@vultisig/core-chain/Chain'
import { bittensorConfig } from '@vultisig/core-chain/chains/bittensor/config'
import { describe, expect, it } from 'vitest'

import { normalizeKeysignFee } from './normalizeKeysignFee'

describe('normalizeKeysignFee', () => {
  it('uses the configured Bittensor fee when the payload fee is zero', () => {
    expect(normalizeKeysignFee({ chain: Chain.Bittensor, feeAmount: 0n })).toBe(
      bittensorConfig.fee
    )
  })

  it('preserves a live Bittensor fee estimate', () => {
    expect(
      normalizeKeysignFee({ chain: Chain.Bittensor, feeAmount: 174930n })
    ).toBe(174930n)
  })

  it('preserves zero for chains without a configured normalization', () => {
    expect(normalizeKeysignFee({ chain: Chain.Ethereum, feeAmount: 0n })).toBe(
      0n
    )
  })
})
