import { CircleView } from '@core/ui/defi/protocols/circle/CircleView'
import { usdc } from '@vultisig/core-chain/coin/knownTokens'

import {
  createDefiQaQueryClient,
  createQaVault,
  DefiQaProviders,
  qaCircleAccountAddress,
  qaEthCoin,
  qaOwnerAddress,
  seedCircleAccount,
  seedCoinBalance,
  seedCoinPrices,
  seedStoredSettings,
} from './fixture'

const vaultUsdc = {
  ...usdc,
  address: qaOwnerAddress,
}

const circleAccountUsdc = {
  ...usdc,
  address: qaCircleAccountAddress,
}

const vault = createQaVault({
  name: 'QA Circle Vault',
  coins: [qaEthCoin, vaultUsdc],
})

const queryClient = createDefiQaQueryClient()

seedStoredSettings({ queryClient })
seedCircleAccount({
  queryClient,
  ownerAddress: qaOwnerAddress,
  accountAddress: qaCircleAccountAddress,
})
seedCoinBalance({
  queryClient,
  coin: circleAccountUsdc,
  balance: 125_000_000n,
})
seedCoinPrices({
  queryClient,
  prices: [
    {
      coin: usdc,
      price: 1,
    },
  ],
})

/** Circle with a funded protocol account — the harness's default scenario. */
export const CircleScenario = () => (
  <DefiQaProviders queryClient={queryClient} vault={vault}>
    <CircleView />
  </DefiQaProviders>
)
