import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { CosmosChain } from '@vultisig/core-chain/Chain'
import { rujiraStakingConfig } from '@vultisig/core-chain/chains/cosmos/thor/rujira/config'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getDenom } from '@vultisig/core-chain/coin/utils/getDenom'
import { match } from '@vultisig/lib-utils/match'

import { RujiPayload, StakeSpecific } from '../types'

// Rujira mints the auto-compounding receipt as `x/staking-${bondDenom}`, e.g.
// `x/staking-x/ruji` (sRUJI). It's redeemed as funds by `liquid.unbond`.
const rujiShareDenom = `x/staking-${rujiraStakingConfig.bondDenom}`

export function getRujiSpecific({ coin, input }: RujiPayload): StakeSpecific {
  const denom =
    getDenom(coin as CoinKey<CosmosChain>) ?? rujiraStakingConfig.bondDenom

  return match<RujiPayload['input']['kind'], StakeSpecific>(input.kind, {
    stake: () => {
      if (!('amount' in input)) {
        throw new Error('Invalid amount')
      }

      const amountUnits = toChainAmount(input.amount, coin.decimals).toString()
      return {
        kind: 'wasm',
        contract: rujiraStakingConfig.contract,
        executeMsg: { account: { bond: {} } },
        funds: [{ denom, amount: amountUnits }],
      }
    },
    unstake: () => {
      if (input.kind !== 'unstake') {
        throw new Error('Invalid amount')
      }

      const enteredUnits = toChainAmount(input.amount, coin.decimals)

      // Bonded (yielding) position: withdraw the RUJI amount directly.
      if (input.position === 'bonded') {
        return {
          kind: 'wasm',
          contract: rujiraStakingConfig.contract,
          executeMsg: {
            account: { withdraw: { amount: enteredUnits.toString() } },
          },
          funds: [],
        }
      }

      // Auto-compounding (liquid) position: redeem the sRUJI receipt via
      // `liquid.unbond`, converting the entered underlying RUJI amount into
      // receipt shares. At/above the full position value redeem the exact
      // receipt balance (avoids rounding dust and can't exceed what's held, even
      // if the share price moved since the amount was entered); below it convert
      // proportionally. The message carries no amount — the funds do.
      const shares =
        enteredUnits >= input.liquidSize
          ? input.liquidShares
          : (input.liquidShares * enteredUnits) / input.liquidSize

      // A tiny amount can floor to zero shares; redeeming 0 is a no-op that
      // would fail on-chain, so reject it rather than build an empty unbond.
      if (shares <= 0n) {
        throw new Error('Amount too small to unstake')
      }

      return {
        kind: 'wasm',
        contract: rujiraStakingConfig.contract,
        executeMsg: { liquid: { unbond: {} } },
        funds: [{ denom: rujiShareDenom, amount: shares.toString() }],
      }
    },
    claim: () => ({
      kind: 'wasm',
      contract: rujiraStakingConfig.contract,
      executeMsg: { account: { claim: {} } },
      funds: [],
    }),
  })
}
