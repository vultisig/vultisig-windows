import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import { useEffect } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { ChainAction } from '../ChainAction'
import { useCorrectSelectedCoin } from '../state/coin/coinPolicy'

export const {
  useState: useDepositCoin,
  provider: InternalDepositCoinProvider,
} = getStateProviderSetup<AccountCoin>('DepositCoin')

const DepositCoinManager = ({ action }: { action: ChainAction }) => {
  const [coin, setCoin] = useDepositCoin()
  const chain = coin?.chain
  const coins = useCurrentVaultCoins()
  const correctCoin = useCorrectSelectedCoin({
    chain,
    action,
    selected: coin,
    coins,
  })

  useEffect(() => {
    const correctedCoin = correctCoin()
    const isSameAsBefore =
      (!!correctedCoin && !!coin && correctedCoin.ticker === coin.ticker) ||
      (!correctedCoin && !coin)
    if (!isSameAsBefore && correctedCoin) setCoin(correctedCoin)
  }, [coin, correctCoin, setCoin])

  return null
}
export const DepositCoinProvider = ({
  children,
  action,
  initialCoin,
}: ChildrenProp & { initialCoin: AccountCoin; action: ChainAction }) => (
  <InternalDepositCoinProvider initialValue={initialCoin}>
    <DepositCoinManager action={action} />
    {children}
  </InternalDepositCoinProvider>
)
