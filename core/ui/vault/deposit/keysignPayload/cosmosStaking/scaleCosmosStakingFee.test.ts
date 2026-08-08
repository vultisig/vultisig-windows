import { Chain } from '@vultisig/core-chain/Chain'
import { getCosmosStakingGasLimit } from '@vultisig/core-chain/chains/cosmos/cosmosGasLimitRecord'
import { describe, expect, it } from 'vitest'

import { scaleCosmosStakingFee } from './scaleCosmosStakingFee'

describe('scaleCosmosStakingFee', () => {
  it('rounds bulk staking fees up to preserve the single-message gas price', () => {
    const gas = 101n

    for (const chain of [Chain.Terra, Chain.TerraClassic] as const) {
      const singleMsgGasLimit = getCosmosStakingGasLimit({ chain })

      for (let msgCount = 2; msgCount <= 10; msgCount++) {
        const gasLimit = getCosmosStakingGasLimit({ chain, msgCount })
        const scaledFee = scaleCosmosStakingFee({
          gas,
          gasLimit,
          singleMsgGasLimit,
        })

        expect(scaledFee * singleMsgGasLimit).toBeGreaterThanOrEqual(
          gas * gasLimit
        )
      }
    }
  })

  it('does not change the single-message fee', () => {
    expect(
      scaleCosmosStakingFee({
        gas: 123n,
        gasLimit: 500_000n,
        singleMsgGasLimit: 500_000n,
      })
    ).toBe(123n)
  })

  it('keeps the original fee when a gas limit is unavailable', () => {
    expect(
      scaleCosmosStakingFee({
        gas: 123n,
        gasLimit: 0n,
        singleMsgGasLimit: 500_000n,
      })
    ).toBe(123n)
  })
})
