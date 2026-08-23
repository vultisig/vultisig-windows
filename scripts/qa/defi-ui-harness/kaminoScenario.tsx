import { KaminoEarnView } from '@core/ui/defi/chain/solana/kamino/KaminoEarnView'
import { kaminoEarnPositionId } from '@core/ui/defi/chain/solana/kamino/positionId'
import { kaminoUnderlyingCoin } from '@core/ui/defi/chain/solana/kamino/underlyingCoin'
import { Chain } from '@vultisig/core-chain/Chain'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import {
  createDefiQaQueryClient,
  createQaVault,
  DefiQaProviders,
  qaSolanaCoin,
  qaSolanaOwnerAddress,
  seedCoinPrices,
  seedDefiPositions,
  seedStoredSettings,
} from './fixture'
import { qaKaminoDescriptor, seedKaminoEarn } from './kaminoFixture'

// One funded vault and two untouched ones, so both card states are on screen
// together — which is how the Figma presents them.
const vaults = [
  {
    descriptor: qaKaminoDescriptor(0),
    name: 'Steakhouse USDC High Yield',
    apy30d: 0.0733,
    tokensPerShare: '1.25',
    shares: 800,
    pnlToken: 200,
  },
  {
    descriptor: qaKaminoDescriptor(1),
    name: 'RockawayX RWA USDC',
    apy30d: 0.0748,
    tokensPerShare: '1.02',
    shares: 0,
  },
  {
    descriptor: qaKaminoDescriptor(2),
    name: 'Allez SOL',
    apy30d: 0.0839,
    tokensPerShare: '1.0749',
    shares: 0,
  },
]

const vault = createQaVault({
  name: 'QA Kamino Vault',
  coins: [qaSolanaCoin],
})

const queryClient = createDefiQaQueryClient()

seedStoredSettings({ queryClient })
seedDefiPositions({
  queryClient,
  positions: {
    [Chain.Solana]: vaults.map(({ descriptor }) =>
      kaminoEarnPositionId(descriptor.address)
    ),
  },
})
seedKaminoEarn({
  queryClient,
  owner: qaSolanaOwnerAddress,
  vaults,
})
// Deduplicated exactly as the Earn view deduplicates before querying — the
// price query keys on the coin list, so a list of a different length is a
// different key, and the seed would be missed in favour of a real request.
const underlyingCoins = Object.values(
  Object.fromEntries(
    vaults
      .map(({ descriptor }) => kaminoUnderlyingCoin(descriptor))
      .map(coin => [coinKeyToString({ chain: coin.chain, id: coin.id }), coin])
  )
)

seedCoinPrices({
  queryClient,
  prices: underlyingCoins.map(coin => ({ coin, price: 1 })),
})

/** Kamino Earn with one funded vault and two empty ones. */
export const KaminoScenario = () => (
  <DefiQaProviders queryClient={queryClient} vault={vault}>
    <KaminoEarnView />
  </DefiQaProviders>
)
