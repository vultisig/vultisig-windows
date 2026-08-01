import '@core/ui/i18n/config'

import { TonstakersView } from '@core/ui/chain/ton/tonstakers/components/TonstakersView'
import { TonstakersPage } from '@core/ui/chain/ton/tonstakers/TonstakersPage'
import { CircleView } from '@core/ui/defi/protocols/circle/CircleView'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { usdc } from '@vultisig/core-chain/coin/knownTokens'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import styled from 'styled-components'

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
  seedTonstakersPosition,
  seedTonstakersProtocolInfo,
} from './fixture'

const scenario = new URLSearchParams(window.location.search).get('scenario')

const qaTonOwnerAddress =
  '0:1111111111111111111111111111111111111111111111111111111111111111'

const qaTonCoin = {
  ...chainFeeCoin[Chain.Ton],
  chain: Chain.Ton,
  address: qaTonOwnerAddress,
}

const vaultUsdc = {
  ...usdc,
  address: qaOwnerAddress,
}

const circleAccountUsdc = {
  ...usdc,
  address: qaCircleAccountAddress,
}

const isTonstakersScenario = scenario?.startsWith('tonstakers') ?? false

const vault = createQaVault(
  isTonstakersScenario
    ? { name: 'QA TON Vault', coins: [qaTonCoin] }
    : { name: 'QA Circle Vault', coins: [qaEthCoin, vaultUsdc] }
)

const queryClient = createDefiQaQueryClient()

seedStoredSettings({ queryClient })
if (isTonstakersScenario) {
  const protocol = {
    name: 'Tonstakers',
    apr: 11.89,
    minStake: 1_000_000_000n,
    tonPerTsTon: 1.1406,
  }

  seedCoinBalance({ queryClient, coin: qaTonCoin, balance: 25_000_000_000n })
  seedCoinPrices({
    queryClient,
    prices: [{ coin: qaTonCoin, price: 5.25 }],
  })
  seedTonstakersProtocolInfo({ queryClient, protocol })
  seedTonstakersPosition({
    queryClient,
    ownerAddress: qaTonOwnerAddress,
    position:
      scenario === 'tonstakers-empty'
        ? null
        : {
            ...protocol,
            jettonBalance: 12_345_000_000n,
            jettonWalletAddress:
              '0:2222222222222222222222222222222222222222222222222222222222222222',
          },
  })
} else {
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
}

const scenarioContent = (() => {
  if (scenario === 'tonstakers-stake') return <TonstakersPage />
  if (scenario === 'tonstakers-unstake') return <TonstakersPage />
  if (isTonstakersScenario) return <TonstakersView />
  return <CircleView />
})()

const initialView =
  scenario === 'tonstakers-stake' || scenario === 'tonstakers-unstake'
    ? {
        id: 'tonstakers' as const,
        state: {
          action:
            scenario === 'tonstakers-stake'
              ? ('stake' as const)
              : ('unstake' as const),
        },
      }
    : undefined

const Page = styled.div`
  width: 430px;
  min-height: 720px;
  margin: 0 auto;
`

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Missing root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <DefiQaProviders
      queryClient={queryClient}
      vault={vault}
      initialView={initialView}
    >
      <Page>{scenarioContent}</Page>
    </DefiQaProviders>
  </StrictMode>
)
