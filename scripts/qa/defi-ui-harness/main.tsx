import { CircleView } from '@core/ui/defi/protocols/circle/CircleView'
import '@core/ui/i18n/config'
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

seedStoredSettings(queryClient)
seedCircleAccount(queryClient, {
  ownerAddress: qaOwnerAddress,
  accountAddress: qaCircleAccountAddress,
})
seedCoinBalance(queryClient, {
  coin: circleAccountUsdc,
  balance: 125_000_000n,
})
seedCoinPrices(queryClient, {
  prices: [
    {
      coin: usdc,
      price: 1,
    },
  ],
})

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
    <DefiQaProviders queryClient={queryClient} vault={vault}>
      <Page>
        <CircleView />
      </Page>
    </DefiQaProviders>
  </StrictMode>
)
