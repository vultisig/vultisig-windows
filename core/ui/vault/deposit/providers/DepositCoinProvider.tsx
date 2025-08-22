import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import { useEffect } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { ChainAction } from '../ChainAction'
import { useCorrectSelectedCoin } from '../hooks/useCorrectSelectedCoin'
import { useDepositAction } from './DepositActionProvider'

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
      !!correctedCoin && correctedCoin.ticker === coin.ticker

    if (!isSameAsBefore && correctedCoin) setCoin(correctedCoin)
  }, [coin, correctCoin, setCoin])

  return null
}
export const DepositCoinProvider = ({
  children,
  initialCoin,
}: ChildrenProp & { initialCoin: AccountCoin }) => {
  const [action] = useDepositAction()

  return (
    <InternalDepositCoinProvider initialValue={initialCoin}>
      <DepositCoinManager action={action} />
      {children}
    </InternalDepositCoinProvider>
  )
}
