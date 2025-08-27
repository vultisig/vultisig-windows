import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ChildrenProp } from '@lib/ui/props'
import { useLayoutEffect, useMemo } from 'react'

import { useCurrentVaultCoins } from '../state/currentVaultCoins'
import { ChainAction } from './ChainAction'
import { useCorrectSelectedCoin } from './hooks/useCorrectSelectedCoin'
import { useDepositCoin } from './providers/DepositCoinProvider'

export const DepositCoinManager = ({
  action,
  children,
}: ChildrenProp & { action: ChainAction }) => {
  const [coin, setCoin] = useDepositCoin()
  const coins = useCurrentVaultCoins()
  const chain = coin?.chain

  const { correctedCoin, isReady } = useCorrectSelectedCoin({
    chain,
    action,
    selected: coin,
    coins,
  })

  const needsCorrection = useMemo(() => {
    if (!coin || !correctedCoin || !isReady) return false
    return coin.ticker !== correctedCoin.ticker
  }, [isReady, coin, correctedCoin])

  useLayoutEffect(() => {
    if (needsCorrection && correctedCoin) {
      setCoin(correctedCoin)
    }
  }, [needsCorrection, correctedCoin, setCoin])

  if (!isReady || needsCorrection || !coin) {
    return (
      <CenterAbsolutely>
        <Spinner size="3em" />
      </CenterAbsolutely>
    )
  }

  return children
}
