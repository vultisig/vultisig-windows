import { WithdrawablePositions } from '@core/ui/vault/chain/positions/WithdrawablePositions'
import { useMergeableTokenBalancesQuery } from '@core/ui/vault/deposit/hooks/useMergeableTokenBalancesQuery'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Panel } from '@lib/ui/panel/Panel'
import { Chain } from '@vultisig/core-chain/Chain'
import { knownCosmosTokens } from '@vultisig/core-chain/coin/knownTokens/cosmos'

/**
 * Rujira "merged" position (e.g. `RUJI (Merged)`, aggregating the Kujira-merge
 * tokens KUJI/rKUJI/FUZN/NSTK/WINK/LVN). Lives under `DeFi → Staked` to mirror
 * iOS, where merged balances are surfaced in the staking section rather than the
 * wallet token list. Renders only when the vault holds RUJI and has a non-zero
 * merged balance.
 */
export const RujiMergedPositionCard = () => {
  const coins = useCurrentVaultCoins()
  const { data } = useMergeableTokenBalancesQuery()

  const rujiCoin = coins.find(
    coin =>
      coin.chain === Chain.THORChain &&
      coin.ticker === knownCosmosTokens.THORChain['x/ruji'].ticker
  )

  if (!rujiCoin || !data || data.totalShares <= 0) return null

  return (
    <Panel>
      <WithdrawablePositions value={rujiCoin} />
    </Panel>
  )
}
