import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { describe, expect, it } from 'vitest'

import {
  kaminoEarnPositionId,
  kaminoVaultAddressFromPositionId,
} from './positionId'

const [steakhouse] = kaminoVaultRegistry

describe('kamino earn position ids', () => {
  it('round-trips every curated vault address', () => {
    for (const { address } of kaminoVaultRegistry) {
      expect(
        kaminoVaultAddressFromPositionId(kaminoEarnPositionId(address))
      ).toBe(address)
    }
  })

  it('keys on the vault address, so a rename cannot orphan a stored id', () => {
    expect(kaminoEarnPositionId(steakhouse.address)).toBe(
      `solana-earn-kamino-${steakhouse.address}`
    )
  })

  it('claims no id belonging to another position type', () => {
    expect(kaminoVaultAddressFromPositionId('solana-stake-sol')).toBeUndefined()
    expect(kaminoVaultAddressFromPositionId('thor-stake-tcy')).toBeUndefined()
  })
})
