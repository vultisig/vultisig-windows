import { qbtcFeeDenom } from '@core/ui/qbtc/dapp/qbtcDirectConstants'
import { Chain } from '@vultisig/core-chain/Chain'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { StakingChain } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

/**
 * Canonical Cosmos staking bond denom for a staking chain (e.g. `uluna` for
 * the Terra family, `qbtc` for QBTC). QBTC lives in `OtherChain` rather than
 * `CosmosChain`, so it isn't keyed in `cosmosFeeCoinDenom` — resolve it
 * directly; every other staking chain indexes the fee-denom record.
 */
export const stakingDenomForChain = (chain: StakingChain): string =>
  chain === Chain.QBTC ? qbtcFeeDenom : cosmosFeeCoinDenom[chain]
