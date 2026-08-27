import { TronDefiDashboard } from '@core/ui/defi/chain/tron/TronDefiDashboard'
import { DepositPage } from '@core/ui/vault/deposit/DepositPage'
import { DepositActionProvider } from '@core/ui/vault/deposit/providers/DepositActionProvider'
import { DepositCoinProvider } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { tronWithdrawExpireUnfreezeAction } from '@core/ui/vault/deposit/tron/withdrawExpireUnfreeze'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'

import {
  createDefiQaQueryClient,
  createQaVault,
  DefiQaProviders,
  qaTronAddress,
  qaTronCoin,
  seedCoinPrices,
  seedStoredSettings,
  seedTronAccountResources,
} from './fixture'

const vault = createQaVault({
  name: 'QA TRON Vault',
  coins: [qaTronCoin],
})

const queryClient = createDefiQaQueryClient()

seedStoredSettings({ queryClient })
seedCoinPrices({
  queryClient,
  prices: [{ coin: qaTronCoin, price: 0.34 }],
})

const now = Date.now()
seedTronAccountResources({
  queryClient,
  address: qaTronAddress,
  resources: {
    bandwidth: { available: 420, total: 600, used: 180 },
    energy: { available: 2_400, total: 3_000, used: 600 },
    frozenForBandwidthSun: 5_000_000n,
    frozenForEnergySun: 10_000_000n,
    unfreezingEntries: [
      { unfreezeAmountSun: 12_500_000n, expireTimeMs: now - 60_000 },
      { unfreezeAmountSun: 7_250_000n, expireTimeMs: now + 86_400_000 },
    ],
  },
})

/** TRON resources with one matured and one future Stake 2.0 withdrawal. */
export const TronWithdrawalsScenario = () => (
  <DefiQaProviders queryClient={queryClient} vault={vault}>
    <TronDefiDashboard />
  </DefiQaProviders>
)

/** The fieldless Claim action after it enters the existing deposit/sign flow. */
export const TronClaimFormScenario = () => (
  <DefiQaProviders
    queryClient={queryClient}
    vault={vault}
    initialView={{
      id: 'deposit',
      state: {
        coin: extractCoinKey(qaTronCoin),
        action: tronWithdrawExpireUnfreezeAction,
        form: { amount: '12.5' },
        entryPoint: 'defi',
      },
    }}
  >
    <DepositActionProvider>
      <DepositCoinProvider>
        <DepositPage />
      </DepositCoinProvider>
    </DepositActionProvider>
  </DefiQaProviders>
)
